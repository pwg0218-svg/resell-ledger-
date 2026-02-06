import { useState, useEffect } from 'react';

// API URL (서버 주소와 동일하게 맞춤)
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `http://${window.location.hostname}:3001`;

export default function PurchaseForm({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        purchaseDate: new Date().toISOString().split('T')[0],
        expenseType: 'merchandise',
        proofType: 'tax_invoice',
        totalPrice: '',
        supplyPrice: '',
        vat: '',
        paymentMethod: 'card',
        registrationNumber: '',
        source: '',
        name: '',
        brand: '',
        size: '',
        memo: '',
        status: 'Purchased',
        imageUrl: '' // 서버 업로드 경로 (/uploads/...)
    });

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                purchaseDate: initialData.date || initialData.purchaseDate,
            });
        } else {
            setFormData({
                purchaseDate: new Date().toISOString().split('T')[0],
                expenseType: 'merchandise',
                proofType: 'tax_invoice',
                totalPrice: '',
                supplyPrice: '',
                vat: '',
                paymentMethod: 'card',
                registrationNumber: '',
                source: '',
                name: '',
                brand: '',
                size: '',
                memo: '',
                status: 'Purchased',
                imageUrl: ''
            });
        }
    }, [initialData, isOpen]);

    // ... (기존 계산 로직 동일)
    const handleTotalChange = (value) => {
        const total = Number(value);
        if (!total) {
            setFormData(prev => ({ ...prev, totalPrice: value, supplyPrice: '', vat: '' }));
            return;
        }
        if (formData.proofType === 'invoice_free' || formData.proofType === 'simple_receipt') {
            setFormData(prev => ({ ...prev, totalPrice: value, supplyPrice: total, vat: 0 }));
        } else {
            const supply = Math.round(total / 1.1);
            const vat = total - supply;
            setFormData(prev => ({ ...prev, totalPrice: value, supplyPrice: supply, vat: vat }));
        }
    };

    const handleProofTypeChange = (type) => {
        const total = Number(formData.totalPrice);
        let supply = formData.supplyPrice;
        let vat = formData.vat;
        if (total) {
            if (type === 'invoice_free' || type === 'simple_receipt') {
                supply = total;
                vat = 0;
            } else {
                supply = Math.round(total / 1.1);
                vat = total - supply;
            }
        }
        setFormData(prev => ({ ...prev, proofType: type, supplyPrice: supply, vat: vat }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'totalPrice') handleTotalChange(value);
        else if (name === 'proofType') handleProofTypeChange(value);
        else setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 파일 업로드 핸들러
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: uploadData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            // 서버에서 받은 상대 경로 저장 (/uploads/filename)
            setFormData(prev => ({ ...prev, imageUrl: data.url }));
        } catch (error) {
            console.error('Upload Error:', error);
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    // ... (스타일링 클래스 동일)
    const labelStyle = "text-sm font-medium text-gray-700 mb-1 block";
    const inputStyle = "w-full p-2 rounded border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all";
    const badgeStyle = (active, type) => `px-3 py-1 rounded-full text-sm font-medium border cursor-pointer transition-all ${active ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
        }`;

    // 이미지 URL 처리 (http 포함 여부 확인)
    const getFullImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${API_BASE}${url}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-xl w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {initialData ? '구매 내역 수정' : '새 구매 내역 등록'}
                        </h2>
                        <p className="text-xs text-muted">세무 증빙을 위해 정확한 정보를 입력해주세요.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* 1. 회계 정보 (기존 유지) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-800">1. 회계 정보</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">세무 필수</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>거래일자</label>
                                <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className={inputStyle} required />
                            </div>
                            <div>
                                <label className={labelStyle}>지출 구분</label>
                                <select name="expenseType" value={formData.expenseType} onChange={handleChange} className={inputStyle}>
                                    <option value="merchandise">상품 매입</option>
                                    <option value="shipping">운반/택배비</option>
                                    <option value="fee">수수료</option>
                                    <option value="supplies">소모품/비품</option>
                                    <option value="other">기타 비용</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>증빙 유형</label>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => handleProofTypeChange('tax_invoice')} className={badgeStyle(formData.proofType === 'tax_invoice')}>세금계산서</button>
                                <button type="button" onClick={() => handleProofTypeChange('part_card')} className={badgeStyle(formData.proofType === 'card')}>카드전표</button>
                                <button type="button" onClick={() => handleProofTypeChange('cash_receipt')} className={badgeStyle(formData.proofType === 'cash_receipt')}>현금영수증</button>
                                <button type="button" onClick={() => handleProofTypeChange('invoice_free')} className={badgeStyle(formData.proofType === 'invoice_free')}>계산서(면세)</button>
                                <button type="button" onClick={() => handleProofTypeChange('simple_receipt')} className={badgeStyle(formData.proofType === 'simple_receipt')}>간이영수증</button>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <label className="text-sm font-bold text-blue-900 mb-1 block">합계 금액 (Total)</label>
                            <input type="number" name="totalPrice" value={formData.totalPrice} onChange={handleChange} className="w-full text-2xl font-bold p-3 text-right rounded border border-blue-200 outline-none" required placeholder="0" />
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                <span>공급가: {Number(formData.supplyPrice).toLocaleString()}</span>
                                <span>부가세: {Number(formData.vat).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>거래처명</label>
                                <input type="text" name="source" value={formData.source} onChange={handleChange} className={inputStyle} placeholder="상호명" required />
                            </div>
                            <div>
                                <label className={labelStyle}>사업자번호 (선택)</label>
                                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-4"></div>

                    {/* 2. 품목 정보 */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-800">2. 품목 및 증빙</span>
                        </div>

                        {/* 파일 업로드 영역 */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 hover:border-primary transition-colors">
                            <label className={labelStyle}>📸 영수증 사진 / 증빙 자료</label>
                            <div className="flex items-start gap-4">
                                {/* 미리보기 */}
                                {formData.imageUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={getFullImageUrl(formData.imageUrl)}
                                            alt="Receipt"
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, imageUrl: '' }))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                                        <span className="text-2xl">📷</span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-slate-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-violet-50 file:text-violet-700
                                          hover:file:bg-violet-100
                                        "
                                        disabled={isUploading}
                                    />
                                    <p className="text-xs text-muted mt-2">
                                        {isUploading ? '업로드 중...' : 'JPG, PNG 파일을 선택하세요. (최대 10MB)'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>상품명</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyle} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>브랜드</label>
                                <input type="text" name="brand" value={formData.brand} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div className="col-span-2">
                                <label className={labelStyle}>사이즈 (KR mm 입력 시 자동 변환)</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleChange}
                                        className={`${inputStyle} w-24`}
                                        placeholder="230"
                                        min="220"
                                        max="310"
                                        step="5"
                                    />
                                    <span className="text-sm text-gray-500">mm</span>
                                </div>
                                {formData.size && Number(formData.size) >= 220 && Number(formData.size) <= 330 && (() => {
                                    // 나이키 공식 사이즈 차트 - 발 길이(cm) 기준 정밀 데이터
                                    // 출처: Nike.com 공식 Men's Shoe Size Chart
                                    const sizeChart = {
                                        220: { eu: '35', us: '3.5', jp: '22.0', footLength: '21.6' },
                                        225: { eu: '36', us: '4', jp: '22.5', footLength: '22.0' },
                                        230: { eu: '36.5', us: '4.5', jp: '23.0', footLength: '22.4' },
                                        235: { eu: '37.5', us: '5', jp: '23.5', footLength: '22.9' },
                                        240: { eu: '38', us: '5.5', jp: '24.0', footLength: '23.3' },
                                        245: { eu: '38.5', us: '6', jp: '24.5', footLength: '23.7' },
                                        250: { eu: '39', us: '6.5', jp: '25.0', footLength: '24.1' },
                                        255: { eu: '40', us: '7', jp: '25.5', footLength: '24.5' },
                                        260: { eu: '40.5', us: '7.5', jp: '26.0', footLength: '25.0' },
                                        265: { eu: '41', us: '8', jp: '26.5', footLength: '25.4' },
                                        270: { eu: '42', us: '8.5', jp: '27.0', footLength: '25.8' },
                                        275: { eu: '42.5', us: '9', jp: '27.5', footLength: '26.2' },
                                        280: { eu: '43', us: '9.5', jp: '28.0', footLength: '26.7' },
                                        285: { eu: '44', us: '10', jp: '28.5', footLength: '27.1' },
                                        290: { eu: '44.5', us: '10.5', jp: '29.0', footLength: '27.5' },
                                        295: { eu: '45', us: '11', jp: '29.5', footLength: '27.9' },
                                        300: { eu: '45.5', us: '11.5', jp: '30.0', footLength: '28.3' },
                                        305: { eu: '46', us: '12', jp: '30.5', footLength: '28.8' },
                                        310: { eu: '47', us: '12.5', jp: '31.0', footLength: '29.2' },
                                        315: { eu: '47.5', us: '13', jp: '31.5', footLength: '29.6' },
                                        320: { eu: '48', us: '13.5', jp: '32.0', footLength: '30.0' },
                                        325: { eu: '48.5', us: '14', jp: '32.5', footLength: '30.5' },
                                        330: { eu: '49.5', us: '15', jp: '33.0', footLength: '31.3' }
                                    };

                                    const kr = Number(formData.size);
                                    const sizeData = sizeChart[kr];

                                    if (!sizeData) return (
                                        <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded">
                                            ⚠️ 해당 사이즈는 차트에 없습니다. 5mm 단위로 입력해주세요.
                                        </div>
                                    );

                                    return (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                🇪🇺 EU {sizeData.eu}
                                            </span>
                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                🇺🇸 US {sizeData.us}
                                            </span>
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                🇯🇵 JP {sizeData.jp}
                                            </span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                                                Nike 공식 기준
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">취소</button>
                        <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/30">
                            {initialData ? '수정 완료' : '등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
