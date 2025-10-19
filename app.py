from flask import Flask, request, render_template, jsonify
from ocr_utils import detect_spines_and_ocr
import os
from werkzeug.utils import secure_filename

# Folder setup
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Flask setup
app = Flask(__name__, static_folder='static', template_folder='templates')
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max

# Home route
@app.route("/")
def index():
    return render_template("index.html")

# Scan route
@app.route("/scan", methods=["POST"])
def scan():
    # Field name should match your HTML/JS file input name
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)

    # Perform OCR
    results = detect_spines_and_ocr(path)
    return jsonify({"books": results})

if __name__ == "__main__":
    app.run(debug=True)
