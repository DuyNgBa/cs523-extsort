// Cập nhật giao diện thanh trượt & file
document.getElementById('ramLimit').oninput = function() {
    document.getElementById('ramVal').innerText = this.value + " Elements";
}
document.getElementById('fileInput').onchange = function() {
    document.getElementById('fileNameDisplay').innerText = this.files[0] ? this.files[0].name : "Chưa chọn file";
}

// 1. Hàm tạo file mẫu 
function generateSampleFile() {
    // Lấy số lượng từ ô input, mặc định là 20 nếu để trống
    const count = parseInt(document.getElementById('genCount').value) || 20;
    
    // Mỗi số thực 8-byte cần 8 bytes trong bộ nhớ
    const buffer = new ArrayBuffer(count * 8); 
    const view = new DataView(buffer);
    
    for (let i = 0; i < count; i++) {
        // Tạo số thực ngẫu nhiên và lưu ở định dạng Float64 (8-byte)
        view.setFloat64(i * 8, Math.random() * 200 - 100, true);
    }
    
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = `sample_data.bin`; 
    a.click();
}

// 2. Chạy thuật toán (Giữ nguyên logic gọi API)
async function startExternalSort() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files[0]) return alert("Vui lòng chọn file .bin trước!");

    document.getElementById('statusLabel').innerText = "Đang xử lý...";
    document.getElementById('statusLabel').className = "text-warning";
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('ram_limit', document.getElementById('ramLimit').value);

    try {
        const response = await fetch('http://127.0.0.1:5000/sort', { method: 'POST', body: formData });
        const result = await response.json();

        const runContainer = document.getElementById('runsContainer');
        runContainer.innerHTML = "";
        result.runs.forEach((run, i) => {
            const div = document.createElement('div');
            div.className = 'run-item';
            div.innerHTML = `<strong>Run #${i+1}:</strong> [ ${run.map(n => n.toFixed(2)).join(', ')} ]`;
            runContainer.appendChild(div);
        });

        const arrayContainer = document.getElementById('arrayContainer');
        arrayContainer.innerHTML = `<span style="color:#fff">[</span> ` + 
            result.sorted_result.map(n => `<span class="array-val">${n.toFixed(2)}</span>`).join(', ') + 
            ` <span style="color:#fff">]</span>`;

        document.getElementById('totalElements').innerText = result.total_elements;
        document.getElementById('statusLabel').innerText = "Hoàn tất!";
        document.getElementById('statusLabel').className = "text-success";
        
        document.getElementById('downloadArea').innerHTML = `
            <button onclick="window.location.href='http://127.0.0.1:5000/download'" class="btn-main" style="margin-top:15px; width: auto; padding: 10px 30px;">
                <i class="fas fa-download"></i> Tải File Kết Quả
            </button>`;

    } catch (e) {
        alert("Lỗi kết nối Server!");
        document.getElementById('statusLabel').innerText = "Lỗi!";
    }
}