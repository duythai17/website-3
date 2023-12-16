const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Kết nối tới MongoDB Atlas
mongoose.connect('mongodb+srv://duyth799:ko7f0APk2MX6lUso@cluster0.zvhpbft.mongodb.net/mydatabase_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Đã kết nối tới MongoDB Atlas');
}).catch((error) => {
    console.error('Lỗi kết nối tới MongoDB Atlas:', error);
});

// Định nghĩa Schema cho dữ liệu trọng lượng
const itemSchema = new mongoose.Schema({
    weight: mongoose.Schema.Types.Decimal128,
});

// Tạo model từ Schema
const UpdateTest = mongoose.model('update_test1', itemSchema);

// Sự kiện khi có client kết nối
io.on('connection', (socket) => {
    console.log('Client đã kết nối');

    // Gửi dữ liệu trọng lượng cho client khi mới kết nối
    sendWeightData(socket);

    // Cập nhật dữ liệu mỗi giây
    const updateInterval = setInterval(() => {
        sendWeightData(socket);
    }, 1000);

    // Sự kiện khi client ngắt kết nối
    socket.on('disconnect', () => {
        console.log('Client đã ngắt kết nối');
        // Hủy đăng ký cập nhật khi client ngắt kết nối
        clearInterval(updateInterval);
    });
});

// Hàm gửi dữ liệu trọng lượng cho client
function sendWeightData(socket) {
    UpdateTest.findOne().then((result) => {
        if (result) {
            const weightValue = parseFloat(result.weight.toString());
            socket.emit('updateWeight', { weight: weightValue });
        }
    }).catch((error) => {
        console.error('Lỗi khi lấy dữ liệu trọng lượng:', error);
    });
}

// API lấy dữ liệu trọng lượng
app.get('/api/getWeightFromUpdateTest', async (req, res) => {
    try {
        const result = await UpdateTest.findOne();

        if (!result) {
            console.log('Không tìm thấy dữ liệu trong bộ sưu tập.');
            res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
            return;
        }

        console.log('Kết quả từ MongoDB:', result);

        const weightValue = parseFloat(result.weight.toString());

        res.json({ weight: weightValue });
    } catch (error) {
        console.error('Lỗi trong /api/getWeightFromUpdateTest:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// Lắng nghe trên cổng PORT
server.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
