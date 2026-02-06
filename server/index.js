import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data.json');
const PURCHASES_FILE = path.join(__dirname, 'purchases.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());
// 업로드 폴더 정적 서빙
app.use('/uploads', express.static(UPLOADS_DIR));

// Initialize data file & directories
function initData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [] }, null, 2));
    }
    if (!fs.existsSync(PURCHASES_FILE)) {
        fs.writeFileSync(PURCHASES_FILE, JSON.stringify({ purchases: [] }, null, 2));
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
}
initData();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        // 한글 깨짐 방지를 위해 인코딩 처리 (선택사항, 기본적으로 OS 처리)
        // 파일명 충돌 방지를 위해 타임스탬프 추가
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage: storage });


// Read data
function readData() {
    initData();
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
}

// Read purchases data
function readPurchases() {
    initData();
    const content = fs.readFileSync(PURCHASES_FILE, 'utf-8');
    return JSON.parse(content);
}

// Write data
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Write purchases data
function writePurchases(data) {
    fs.writeFileSync(PURCHASES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET - 모든 아이템 조회
app.get('/api/items', (req, res) => {
    try {
        const data = readData();
        res.json(data.items);
    } catch (error) {
        console.error('Error reading items:', error);
        res.status(500).json({ error: 'Failed to read items' });
    }
});

// POST - 새 아이템 추가
app.post('/api/items', (req, res) => {
    try {
        const data = readData();
        const newItem = { ...req.body, id: Date.now() };
        data.items.unshift(newItem);
        writeData(data);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// PUT - 아이템 수정
app.put('/api/items/:id', (req, res) => {
    try {
        const data = readData();
        const id = parseInt(req.params.id);
        const index = data.items.findIndex(item => item.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        data.items[index] = { ...req.body, id };
        writeData(data);
        res.json(data.items[index]);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// DELETE - 아이템 삭제
app.delete('/api/items/:id', (req, res) => {
    try {
        const data = readData();
        const id = parseInt(req.params.id);
        data.items = data.items.filter(item => item.id !== id);
        writeData(data);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// PUT - 전체 데이터 덮어쓰기 (동기화용)
app.put('/api/items', (req, res) => {
    try {
        const items = req.body;
        writeData({ items });
        res.json({ success: true });
    } catch (error) {
        console.error('Error syncing items:', error);
        res.status(500).json({ error: 'Failed to sync items' });
    }
});

// ========== 구매대장 API ==========

// GET - 모든 구매 아이템 조회
app.get('/api/purchases', (req, res) => {
    try {
        const data = readPurchases();
        res.json(data.purchases);
    } catch (error) {
        console.error('Error reading purchases:', error);
        res.status(500).json({ error: 'Failed to read purchases' });
    }
});

// PUT - 구매 데이터 전체 동기화
app.put('/api/purchases', (req, res) => {
    try {
        const purchases = req.body;
        writePurchases({ purchases });
        res.json({ success: true });
    } catch (error) {
        console.error('Error syncing purchases:', error);
        res.status(500).json({ error: 'Failed to sync purchases' });
    }
});

// POST - 파일 업로드
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // 파일 URL 생성 (클라이언트에서 접근 가능하도록)
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname
    });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
    initData();
    console.log('');
    console.log('========================================================');
    console.log('   📦 리셀 관리대장 데이터 서버가 시작되었습니다!');
    console.log(`   🌐 판매대장 API: http://localhost:${PORT}/api/items`);
    console.log(`   🛒 구매대장 API: http://localhost:${PORT}/api/purchases`);
    console.log(`   📸 파일 업로드: http://localhost:${PORT}/api/upload`);
    console.log('========================================================');
    console.log('');
});
