import React, { useState, useEffect } from 'react';
import { calculateMargin } from '../utils/calculations';

export default function ItemForm({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
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
        quantity: 1
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                brand: '',
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
                quantity: 1
            });
        }
    }, [initialData, isOpen]);

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
                        <div className="flex flex-col gap-2" style={{ flex: 2 }}>
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

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>사이즈 (표준)</label>
                            <input
                                type="text"
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                required
                                placeholder="US 8"
                                style={inputStyle}
                            />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>한국 사이즈</label>
                            <input
                                type="text"
                                name="sizeKr"
                                value={formData.sizeKr}
                                onChange={handleChange}
                                placeholder="260"
                                style={inputStyle}
                            />
                        </div>
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
