import cv2
import numpy as np
from PIL import Image
import easyocr

reader = easyocr.Reader(['en'])

def resize_max(img, max_dim=1200):
    h, w = img.shape[:2]
    scale = max_dim / max(h, w) if max(h, w) > max_dim else 1.0
    return cv2.resize(img, (int(w*scale), int(h*scale)))

def detect_spines_and_ocr(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return []
    img = resize_max(img, max_dim=1200)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    sobel = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobel = np.absolute(sobel)
    sobel = np.uint8(255 * sobel / np.max(sobel) if np.max(sobel) != 0 else sobel)
    _, th = cv2.threshold(sobel, 30, 255, cv2.THRESH_BINARY)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 3))
    closed = cv2.morphologyEx(th, cv2.MORPH_CLOSE, kernel, iterations=2)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    h_img, w_img = gray.shape
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w*h < 2000:
            continue
        boxes.append((x, y, w, h))

    results = []
    if not boxes:
        text = do_ocr(img)
        results.append({"bbox": [0, 0, w_img, h_img], "text": text})
        return results

    boxes = sorted(boxes, key=lambda b: b[0])
    for (x, y, w, h) in boxes:
        crop = img[y:y+h, x:x+w]
        text = do_ocr(crop)
        results.append({"bbox": [x, y, w, h], "text": text})
    return results

def do_ocr(bgr_image):
    rgb = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    raw = reader.readtext(np.array(pil))
    texts = [t[1] for t in raw if t[1].strip()]
    return " | ".join(texts)[:500]
