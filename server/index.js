import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data.json');
const PURCHASES_FILE = path.join(__dirname, 'purchases.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
        // 타임스탬프와 원본 이름을 조합하여 파일명 생성
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB 제한
});


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
app.post('/api/upload', (req, res, next) => {
    console.log('Upload request received');
    next();
}, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded successfully:', req.file.filename);
        // 파일 URL 생성 (클라이언트에서 접근 가능하도록)
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalname
        });
    } catch (err) {
        console.error('Upload handler error:', err);
        res.status(500).json({ error: 'Upload handler failed' });
    }
});

// 영수증 분석 API
app.post('/api/analyze-receipt', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const imagePath = path.join(__dirname, imageUrl);
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image file not found' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imageData = fs.readFileSync(imagePath);
        const base64Image = imageData.toString('base64');

        const prompt = `
            사용자가 운동화나 의류 등을 구매한 영수증 사진을 업로드했습니다. 
            이 영수증에서 다음 정보를 추출하여 반드시 JSON 형식으로만 응답해주세요. 
            응답에 JSON 외의 다른 텍스트는 포함하지 마세요.

            필수 추출 정보:
            1. purchaseDate: 거래일자 (YYYY-MM-DD 형식)
            2. source: 거래처명 (상호명, 예: 나이키 가산점, ABC마트 등)
            3. totalPrice: 합계 금액 (숫자만)
            4. name: 주요 구매 상품명 (가장 비싼 품목 하나 또는 요약)
            5. paymentMethod: 결제 수단 (card, cash, transfer 중 하나로 매핑)

            JSON 예시:
            {
                "purchaseDate": "2024-05-20",
                "source": "ABC마트 명동점",
                "totalPrice": 129000,
                "name": "나이키 에어포스 1",
                "paymentMethod": "card"
            }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg" // 업로드된 파일의 실제 타입에 맞춰 개선 가능
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // JSON 추출 (마크다운 코드 블록 제거 등)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response as JSON');
        }

        const structuredData = JSON.parse(jsonMatch[0]);
        res.json(structuredData);

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ error: '영수증 분석 중 오류가 발생했습니다.' });
    }
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
