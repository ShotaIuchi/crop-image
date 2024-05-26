#!/usr/bin/env python
# -*- coding: utf-8 -*-

from datetime import datetime
import io
import os
from flask import Flask, request, send_file, render_template, abort, jsonify
from PIL import Image
import adb_tool_py as adb_tool

# Input image file path
IMAGE_PATH = os.getenv('IMAGE_PATH', 'input.png')

# Output image directory
OUTPUT_DIR = os.getenv('OUTPUT_DIR', 'output')

# Flask engine
app = Flask(__name__, template_folder='.')


@app.route('/')
def home():
    return render_template('index.html', image_file=IMAGE_PATH)


@app.route('/crop', methods=['POST'])
def crop():
    # request parameters
    startX = request.form.get('startX', type=int, default=0)
    startY = request.form.get('startY', type=int, default=0)
    endX = request.form.get('endX', type=int, default=0)
    endY = request.form.get('endY', type=int, default=0)
    filename = request.form.get('filename', default=f'{datetime.now().strftime("%Y%m%dT%H%M%S")}.png')

    # Input validation
    if not filename.strip():
        return "File name is required.", 400

    # Normalize coordinates
    if startX > endX:
        startX, endX = endX, startX
    if startY > endY:
        startY, endY = endY, startY

    if startX == endX or startY == endY:
        return "Invalid rectangle coordinates.", 400

    # ensure filename has .png extension
    if not filename.lower().endswith('.png'):
        filename += '.png'

    # load image
    img_path = os.path.join(app.root_path, 'static', IMAGE_PATH)
    if not os.path.exists(img_path):
        abort(404, description="Image not found")

    # open image
    img = Image.open(img_path)

    # crop image
    cropped_img = img.crop((startX, startY, endX, endY))

    # save image to output directory
    os.makedirs(os.path.join(app.root_path, OUTPUT_DIR), exist_ok=True)
    cropped_img.save(os.path.join(app.root_path, OUTPUT_DIR, filename))

    # response image to client
    img_io = io.BytesIO()
    cropped_img.save(img_io, 'PNG')
    img_io.seek(0)
    return send_file(img_io, mimetype='image/png')


@app.route('/update-image', methods=['POST'])
def update_image():
    try:
        adb = adb_tool.AdbTool()
        adb.capture_screenshot()
        adb.save_screenshot("./static/input.png")
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e))


if __name__ == '__main__':
    app.run(debug=True)
