from ultralytics import YOLO
import cv2
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "press1.pt")
model = YOLO(MODEL_PATH)

Y_LINE = 323  # press counted when press_head bottom crosses this line

def get_overlap(gl, ph):
    """how much of gloves bbox is inside press_head bbox"""
    xA = max(gl[0], ph[0])
    yA = max(gl[1], ph[1])
    xB = min(gl[2], ph[2])
    yB = min(gl[3], ph[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    gloveArea = (gl[2] - gl[0]) * (gl[3] - gl[1])
    return interArea / gloveArea if gloveArea > 0 else 0


def analyze_video(video_path):
    cap = cv2.VideoCapture(video_path)

    press_count = 0
    ppe = {"helmet": False, "vest": False, "gloves": False}

    # cycle state
    gloves_inside  = False
    gloves_exited  = False
    press_crossed  = False

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame, verbose=False)[0]

        detections = {}
        for box in results.boxes:
            cls_name = model.names[int(box.cls)]
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            if cls_name == "helmet": ppe["helmet"] = True
            if cls_name == "vest":   ppe["vest"]   = True
            if cls_name == "gloves": ppe["gloves"]  = True

            detections[cls_name] = [x1, y1, x2, y2]

        ph = detections.get("press_head")
        gl = detections.get("gloves")

        # --- gloves state ---
        if ph and gl:
            overlap = get_overlap(gl, ph)
            if overlap > 0.5 and not gloves_inside:
                gloves_inside = True
                gloves_exited = False
                press_crossed = False  # reset for new cycle

            if overlap < 0.1 and gloves_inside:
                gloves_exited = True
                gloves_inside = False

        # --- press head crosses Y line ---
        if ph and gloves_exited:
            press_head_bottom = ph[3]  # y2 = bottom of bbox
            if press_head_bottom >= Y_LINE and not press_crossed:
                press_crossed = True

            # press came back up = full cycle complete
            if press_crossed and press_head_bottom < Y_LINE:
                press_count += 1
                press_crossed = False
                gloves_exited = False
                print(f"Press counted! Total: {press_count}")

    cap.release()

    violations = []
    if not ppe["helmet"]: violations.append("no_helmet")
    if not ppe["vest"]:   violations.append("no_vest")
    if not ppe["gloves"]: violations.append("no_gloves")

    return {
        "press_count": press_count,
        "ppe":         ppe,
        "violations":  violations
    }