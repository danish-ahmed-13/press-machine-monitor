from flask import Flask
from flask_cors import CORS
from db.database import init_db
from routes.session import session_bp
from routes.metrics import metrics_bp
from routes.violations import violations_bp

app = Flask(__name__)
CORS(app)

# register route blueprints
app.register_blueprint(session_bp)
app.register_blueprint(metrics_bp)
app.register_blueprint(violations_bp)

if __name__ == "__main__":
    init_db()  # creates tables if they don't exist
    app.run(debug=True, port=5000)