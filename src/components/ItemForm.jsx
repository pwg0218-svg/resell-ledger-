import React, { useState, useEffect } from 'react';
import { calculateMargin } from '../utils/calculations';
import { findStandardSize } from '../utils/sizeChart';

export default function ItemForm({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        gender: 'Men', // Default gender for sizing
        size: '',
        imageUrl: '',
        purchasePrice: '',
        sellPrice: '',
        purchaseLink: '',
        productNumber: '',
        sizeKr: '',
        paymentMethod: '현금',
        purchaseDate: new Date().toISOString().split('T')[0],
        shippingFee: '3000',
        discountRate: '1.0',
        status: 'Selling',
        cardCompany: '',
        quantity: 1,
        soldQuantity: 0  // 판매된 수량
    });

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData, gender: initialData.gender || 'Men' });
        } else {
            setFormData({
                name: '',
                brand: '',
                gender: 'Men',
                size: '',
                imageUrl: '',
                purchasePrice: '',
                sellPrice: '',
                purchaseLink: '',
                productNumber: '',
                sizeKr: '',
                paymentMethod: '현금',
                purchaseDate: new Date().toISOString().split('T')[0],
                shippingFee: '3000',
                discountRate: '1.0',
                status: 'Selling',
                cardCompany: '',
                quantity: 1,
                soldQuantity: 0
            });
        }
    }, [initialData, isOpen]);

    // Auto-Size Conversion Logic
    useEffect(() => {
        // Only run if sizeKr is present
        if (formData.brand && formData.sizeKr) {
            const standardSize = findStandardSize(formData.brand, formData.gender, formData.sizeKr);
            if (standardSize) {
                setFormData(prev => ({ ...prev, size: standardSize }));
            }
        }
    }, [formData.brand, formData.gender, formData.sizeKr]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', borderRadius: 'var(--radius-lg)', maxHeight: '80dvh', overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '0.75rem', color: '#000000', fontWeight: '800', fontSize: '1.25rem' }}>{initialData ? '상품 정보 수정' : '새 상품 추가'}</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>구매 링크</label>
                        <input
                            type="text"
                            name="purchaseLink"
                            value={formData.purchaseLink}
                            onChange={handleChange}
                            placeholder="https://..."
                            style={inputStyle}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>매입 날짜</label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div className="flex flex-col gap-2" style={{ width: '80px' }}>
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>수량</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                required
                                style={{ ...inputStyle, textAlign: 'center' }}
                            />
                        </div>
                        {Number(formData.quantity) > 1 && (
                            <div className="flex flex-col gap-2" style={{ width: '90px' }}>
                                <label className="text-sm" style={{ color: '#10B981', fontWeight: '600' }}>판매완료</label>
                                <input
                                    type="number"
                                    name="soldQuantity"
                                    value={formData.soldQuantity || 0}
                                    onChange={handleChange}
                                    min="0"
                                    max={formData.quantity}
                                    style={{ ...inputStyle, textAlign: 'center', borderColor: '#10B981', background: 'rgba(16, 185, 129, 0.05)' }}
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>품번 (SKU)</label>
                            <input
                                type="text"
                                name="productNumber"
                                value={formData.productNumber}
                                onChange={handleChange}
                                placeholder="예: CW2288-111"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex flex-col gap-2" style={{ flex: 1 }}>
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>브랜드</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                placeholder="예: Nike"
                                style={inputStyle}
                            />
                        </div>
                        <div className="flex flex-col gap-2" style={{ flex: 1 }}>
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>성별 (사이즈용)</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="Men">남성 (Men)</option>
                                <option value="Women">여성 (Women)</option>
                                <option value="Kids">키즈 (Kids)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>상품명 (모델명)</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>이미지 (파일 선택)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}
                            />
                            {formData.imageUrl && (
                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>한국 사이즈 (KR mm 입력 시 자동변환)</label>
                        <div className="flex gap-4">
                            <input
                                type="number"
                                name="sizeKr"
                                value={formData.sizeKr}
                                onChange={handleChange}
                                placeholder="예: 260"
                                min="200"
                                max="350"
                                step="5"
                                style={{ ...inputStyle, width: '120px' }}
                            />
                            <input
                                type="text"
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                required
                                placeholder="자동 완성 (Auto)"
                                style={{ ...inputStyle, flex: 1 }}
                            />
                        </div>
                        {formData.sizeKr && Number(formData.sizeKr) >= 220 && Number(formData.sizeKr) <= 330 && (() => {
                            // 나이키 공식 사이즈 차트 - 발 길이(cm) 기준 정밀 데이터
                            // 출처: Nike.com 공식 Men's Shoe Size Chart
                            const menSizeChart = {
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
                            // 나이키 공식 Women's Shoe Size Chart
                            const womenSizeChart = {
                                220: { eu: '35.5', us: '5', jp: '22.0', footLength: '22.0' },
                                225: { eu: '36', us: '5.5', jp: '22.5', footLength: '22.4' },
                                230: { eu: '36.5', us: '6', jp: '23.0', footLength: '22.9' },
                                235: { eu: '37.5', us: '6.5', jp: '23.5', footLength: '23.3' },
                                240: { eu: '38', us: '7', jp: '24.0', footLength: '23.7' },
                                245: { eu: '38.5', us: '7.5', jp: '24.5', footLength: '24.1' },
                                250: { eu: '39', us: '8', jp: '25.0', footLength: '24.5' },
                                255: { eu: '40', us: '8.5', jp: '25.5', footLength: '25.0' },
                                260: { eu: '40.5', us: '9', jp: '26.0', footLength: '25.4' },
                                265: { eu: '41', us: '9.5', jp: '26.5', footLength: '25.8' },
                                270: { eu: '42', us: '10', jp: '27.0', footLength: '26.2' },
                                275: { eu: '42.5', us: '10.5', jp: '27.5', footLength: '26.7' },
                                280: { eu: '43', us: '11', jp: '28.0', footLength: '27.1' },
                                285: { eu: '44', us: '11.5', jp: '28.5', footLength: '27.5' },
                                290: { eu: '44.5', us: '12', jp: '29.0', footLength: '27.9' }
                            };

                            const kr = Number(formData.sizeKr);
                            const isMen = formData.gender === 'Men' || formData.gender === 'Kids';
                            const chart = isMen ? menSizeChart : womenSizeChart;
                            const sizeData = chart[kr];

                            if (!sizeData) return null;

                            return (
                                <div className="flex flex-wrap gap-2" style={{ marginTop: '8px' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        color: 'white',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
                                    }}>
                                        🇪🇺 EU {sizeData.eu}
                                    </span>
                                    <span style={{
                                        padding: '6px 12px',
                                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                                        color: 'white',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
                                    }}>
                                        🇺🇸 US {sizeData.us} {isMen ? '(M)' : '(W)'}
                                    </span>
                                    <span style={{
                                        padding: '6px 12px',
                                        background: 'linear-gradient(135deg, #22c55e, #15803d)',
                                        color: 'white',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
                                    }}>
                                        🇯🇵 JP {sizeData.jp}
                                    </span>
                                    <span style={{
                                        padding: '4px 10px',
                                        background: 'rgba(0,0,0,0.1)',
                                        color: '#666',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }}>
                                        {isMen ? '👨 남성' : '👩 여성'}
                                    </span>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>매입 가격 (구매가)</label>
                            <input
                                type="number"
                                name="purchasePrice"
                                value={formData.purchasePrice}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>판매 희망 가격</label>
                            <input
                                type="number"
                                name="sellPrice"
                                value={formData.sellPrice}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>택배/물류비</label>
                            <input
                                type="number"
                                name="shippingFee"
                                value={formData.shippingFee}
                                onChange={handleChange}
                                placeholder="3000"
                                style={inputStyle}
                            />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            {/* Empty placeholder or removing the flex-1 layout adjustment if needed */}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>결제 수단</label>
                        <div className="flex gap-4 items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="현금"
                                    checked={formData.paymentMethod === '현금'}
                                    onChange={handleChange}
                                />
                                <span style={{ color: '#000000' }}>현금 (Cash)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="카드"
                                    checked={formData.paymentMethod === '카드'}
                                    onChange={handleChange}
                                />
                                <span style={{ color: '#000000' }}>카드 (Card)</span>
                            </label>

                            {formData.paymentMethod === '카드' && (
                                <input
                                    type="text"
                                    name="cardCompany"
                                    value={formData.cardCompany || ''}
                                    onChange={handleChange}
                                    placeholder="카드사 입력 (예: 삼성)"
                                    style={{ ...inputStyle, padding: '0.4rem 0.75rem', width: '200px' }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Verification Block */}
                    <div className="glass" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '0.8rem', color: '#000000' }}>
                        <div className="flex justify-between mb-1">
                            <span style={{ fontWeight: 600 }}>예상 수수료 (Fee):</span>
                            <span>₩{calculateMargin(formData).fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span style={{ fontWeight: 600 }}>부가세 환급 (VAT):</span>
                            <span style={{ fontWeight: 700 }}>+₩{calculateMargin(formData).vatRefund.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-black/10 font-bold mb-1">
                            <span>기본 마진 (Basic):</span>
                            <span>₩{calculateMargin(formData).basicMargin.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>최종 마진 (Final):</span>
                            <span>
                                ₩{calculateMargin(formData).finalMargin.toLocaleString()} ({calculateMargin(formData).roiPurchase}%)
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>상태</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="Selling">판매중 (Selling)</option>
                            <option value="Sold">판매완료 (Sold)</option>
                        </select>
                    </div>

                    <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn"
                            style={{ flex: 1, background: 'rgba(0,0,0,0.05)' }}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                        >
                            {initialData ? '수정 완료' : '추가하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(0,0,0,0.1)',
    padding: '0.75rem',
    borderRadius: '8px',
    outline: 'none',
    color: '#1a1a1a'
};
