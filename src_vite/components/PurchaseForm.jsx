import { useState, useEffect, useRef } from 'react';

// API URL (Vite 프록시 설정을 통해 상대 경로 사용)
const API_BASE = '';

export default function PurchaseForm({ isOpen, onClose, onSubmit, initialData }) {
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) setErrorMessage('');
    }, [isOpen]);

    // 이미지 압축 헬퍼 함수 (메모리 최적화)
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const tempUrl = URL.createObjectURL(file);
            const img = new Image();
            img.src = tempUrl;
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // 최대 너비/높이 제한 (예: 1280px)
                    const MAX_SIZE = 1200;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        URL.revokeObjectURL(tempUrl); // 메모리 해제
                        if (!blob) {
                            reject(new Error('Compression failed: Blob is null'));
                            return;
                        }
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7);
                } catch (e) {
                    URL.revokeObjectURL(tempUrl);
                    reject(e);
                }
            };
            img.onerror = (e) => {
                URL.revokeObjectURL(tempUrl);
                reject(new Error('Failed to load image for compression'));
            };
        });
    };

    // 파일 업로드 핸들러
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setErrorMessage(''); // 기존 에러 초기화

        try {
            // 이미지 압축 수행
            const compressedFile = await compressImage(file);

            const uploadData = new FormData();
            uploadData.append('file', compressedFile);

            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: uploadData
            });

            if (!res.ok) {
                const errorText = await res.text().catch(() => 'No error details');
                throw new Error(`${res.status} ${res.statusText}\n${errorText.substring(0, 100)}`);
            }

            const data = await res.json();
            setFormData(prev => ({ ...prev, imageUrl: data.url }));

            // AI 분석 요청
            await analyzeReceipt(data.url);

        } catch (error) {
            console.error('Upload Error:', error);
            setErrorMessage(error.message); // 화면에 에러 표시
        } finally {
            setIsUploading(false);
        }
    };

    // ... (rest of the file) ...

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-xl w-full md:max-w-2xl h-full md:h-auto md:max-h-[80vh] overflow-y-auto rounded-none md:rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* ... Header ... */}
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
                    {/* ... Inputs ... */}

                    {/* 에러 메시지 표시 영역 */}
                    {errorMessage && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-bold text-sm whitespace-pre-wrap animate-pulse">
                            ⚠️ 업로드 실패 원인:<br />
                            {errorMessage}
                        </div>
                    )}

                    {/* 1. 회계 정보 */}
                    <div className="space-y-4">
                        {/* ... */}
                        <div className="flex items-center gap-2 mb-2">
                            {/* ... Content ... */}
                            <span className="text-lg font-bold text-gray-800">1. 회계 정보</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">세무 필수</span>
                        </div>
                        {/* ... (Keep existing inputs) ... */}
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
                                {formData.imageUrl && !isUploading && (
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
                                )}
                                {!formData.imageUrl && !isUploading && (
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                                        <span className="text-2xl">📷</span>
                                    </div>
                                )}
                                {isUploading && (
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center shadow-inner">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            type="button"
                                            onClick={() => cameraInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-xl font-bold shadow-sm hover:bg-primary-hover active:scale-95 transition-all text-sm disabled:opacity-50"
                                        >
                                            <span>📷</span> 카메라 촬영
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-sm disabled:opacity-50"
                                        >
                                            <span>📁</span> 갤러리 선택
                                        </button>
                                    </div>

                                    <input
                                        type="file"
                                        ref={cameraInputRef}
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />

                                    <p className="text-xs text-muted mt-3">
                                        {isUploading ? '사진을 최적화하고 업로드 중입니다...' : (isAnalyzing ? '✨ AI가 내용을 분석하고 있습니다...' : '영수증을 촬영하거나 사진을 선택하세요. (자동 최적화)')}
                                    </p>
                                    {isAiApplied && (
                                        <div className="mt-2 text-xs font-bold text-primary animate-bounce">
                                            ✨ AI가 영수증 정보를 자동으로 입력했습니다!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* ... (Rest of existing inputs like name, brand, size) ... */}
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
                                { /* ... Size chart logic ... */}
                                {formData.size && Number(formData.size) >= 220 && Number(formData.size) <= 330 && (() => {
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
                                    if (!sizeData) return (<div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded">⚠️ 해당 사이즈는 차트에 없습니다. 5mm 단위로 입력해주세요.</div>);
                                    return (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">🇪🇺 EU {sizeData.eu}</span>
                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">🇺🇸 US {sizeData.us}</span>
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">🇯🇵 JP {sizeData.jp}</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">Nike 공식 기준</span>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                    </div>
                    {/* ... (Footer Buttons) ... */}
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
