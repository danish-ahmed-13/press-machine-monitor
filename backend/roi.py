from ultralytics import YOLO
import cv2

model = YOLO(r"C:\Users\USER\Desktop\factory_project\backend\models\press1.pt")
cap = cv2.VideoCapture(r"C:\Users\USER\Desktop\factory_project\backend\mos_test.mp4")

ret, frame = cap.read()
cap.release()

# just show first frame so you can see where to draw the line
print(f"Frame size: {frame.shape[1]}w x {frame.shape[0]}h")

y_line = frame.shape[0] // 2  # start at middle

def nothing(x): pass
cv2.namedWindow("set line")
cv2.createTrackbar("Y line", "set line", y_line, frame.shape[0], nothing)

while True:
    display = frame.copy()
    y = cv2.getTrackbarPos("Y line", "set line")
    cv2.line(display, (0, y), (frame.shape[1], y), (0, 0, 255), 2)
    cv2.putText(display, f"Y = {y}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    cv2.imshow("set line", display)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print(f"Your Y line value: {y}")
        break

cv2.destroyAllWindows()