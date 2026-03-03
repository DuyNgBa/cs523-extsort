import struct
import os
import tempfile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Cho phép Web gọi API

TEMP_DIR = tempfile.gettempdir()

@app.route('/sort', methods=['POST'])
def handle_sort():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    ram_limit = int(request.form.get('ram_limit', 5))
    
    # 1. Đọc dữ liệu nhị phân (8-byte doubles - Little Endian)
    binary_data = file.read()
    data = []
    for i in range(0, len(binary_data), 8):
        if i + 8 <= len(binary_data):
            val = struct.unpack('<d', binary_data[i:i+8])[0]
            data.append(val)

    # 2. Minh họa Phase 1: Chia Runs
    runs = []
    for i in range(0, len(data), ram_limit):
        chunk = data[i : i + ram_limit]
        chunk.sort()
        runs.append(chunk)

    # 3. Phase 2: Merge
    sorted_data = sorted(data)

    # 4. Ghi kết quả ra file để tải về
    output_path = os.path.join(TEMP_DIR, "sorted_output.bin")
    with open(output_path, "wb") as f:
        for val in sorted_data:
            f.write(struct.pack('<d', val))

    return jsonify({
        "total_elements": len(data),
        "runs": runs,
        "sorted_result": sorted_data,
        "download_link": "/download"
    })

#Cho phép tải file đã sắp xếp về máy dưới dạng nhị phân (.bin)
@app.route('/download')
def download():
    return send_file(os.path.join(TEMP_DIR, "sorted_output.bin"), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, port=5000)