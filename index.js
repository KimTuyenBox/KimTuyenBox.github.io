const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Phát hiện biên cạnh của ảnh
function detectEdges(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Chuyển sang ảnh xám
    const grayscale = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
        avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        for (let k = 0; k < 3; k++)
            grayscale[i + k] = avg;
        grayscale[i + 3] = 255
    }

    // Áp dụng bộ lọc Sobel để phát hiện biên cạnh
    const result = new Uint8ClampedArray(width * height * 4);
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    const step_y = width * 4;

    for (let x = 1; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
            let sumX = 0;
            let sumY = 0;
            // Nhân tích chập với bộ lọc
            for (let kx = -1; kx <= 1; kx++) {
                for (let ky = -1; ky <= 1; ky++) {
                    const row = y + ky;
                    const col = x + kx;
                    let idx = row * step_y + col * 4;
                    sumX += grayscale[idx] * sobelX[(kx + 1) * 3 + ky + 1];
                    sumY += grayscale[idx] * sobelY[(kx + 1) * 3 + ky + 1];
                }
            }
            // Lưu kết quả vào result
            const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
            let idx = y * step_y + x * 4;
            for (let k = 0; k < 3; k++)
                result[idx + k] = magnitude;
            result[idx + 3] = 255
        }
    }
    return result;
}

// Vẽ biên cạnh của các frame hình trong video lên canvas
function drawEdges() {
    // Hiển thị frame lên canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Lấy frame hình hiện tại
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Rút trích biên cạnh, lưu image data mới và ghi data này vào context
    var edgeImageData = new ImageData(detectEdges(imageData), canvas.width, canvas.height);
    context.putImageData(edgeImageData, 0, 0);

    // Lấy frame tiếp theo và tiếp tục vẽ
    requestAnimationFrame(drawEdges);
}

video.addEventListener('loadedmetadata', function () {
    // Gán kích thước canvas bằng kích thước nội dung video
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
});

video.addEventListener('play', function () {
    // Thực hiện vẽ biên cạnh lên canvas
    drawEdges();
});