import React, { useState, useEffect } from 'react';
import { calculateMargin } from '../utils/calculations';

export default function MarginCalculator({ isOpen, onClose }) {
    const [calcData, setCalcData] = useState({
        purchasePrice: '',
        sellPrice: '',
        discountPercent: '', // Changed from rate to percent
        fee: 0,
        vatRefund: 0,
        basicMargin: 0,
        finalMargin: 0,
        roiPurchase: 0,
        effectivePurchasePrice: 0
    });

    useEffect(() => {
        if (isOpen) {
            // Convert percent to multiplier logic
            // e.g. 5% discount -> 0.95 multiplier
            const percent = Number(calcData.discountPercent) || 0;
            const discountMultiplier = 1 - (percent / 100);

            // Recalculate whenever inputs change
            const result = calculateMargin({
                purchasePrice: calcData.purchasePrice,
                sellPrice: calcData.sellPrice,
                shippingFee: calcData.shippingFee,
                discountRate: discountMultiplier, // Pass multiplier to utility
                applyDiscount: true, // Enable discount logic
            });

            setCalcData(prev => ({
                ...prev,
                fee: result.fee,
                vatRefund: result.vatRefund,
                basicMargin: result.basicMargin,
                finalMargin: result.finalMargin,
                roiPurchase: result.roiPurchase,
                effectivePurchasePrice: result.effectivePurchasePrice
            }));
        }
    }, [calcData.purchasePrice, calcData.sellPrice, calcData.shippingFee, calcData.discountPercent, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCalcData(prev => ({ ...prev, [name]: value }));
    };

    const inputStyle = {
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(0,0,0,0.1)',
        padding: '0.75rem',
        borderRadius: '8px',
        outline: 'none',
        color: '#1a1a1a',
        width: '100%',
        fontWeight: '600'
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
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{ width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-lg)', maxHeight: '90dvh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 style={{ color: '#000000', fontWeight: '800', fontSize: '1.25rem' }}>⚡ 마진 계산기</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Inputs */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm mb-1 block" style={{ color: '#000000', fontWeight: '600' }}>구매가</label>
                            <input
                                type="number"
                                name="purchasePrice"
                                value={calcData.purchasePrice}
                                onChange={handleChange}
                                placeholder="구매 가격"
                                style={inputStyle}
                                autoFocus
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm mb-1 block" style={{ color: '#000000', fontWeight: '600' }}>판매가 (예상)</label>
                            <input
                                type="number"
                                name="sellPrice"
                                value={calcData.sellPrice}
                                onChange={handleChange}
                                placeholder="판매 가격"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm mb-1 block" style={{ color: '#000000', fontWeight: '600' }}>할인율 (%)</label>
                            <input
                                type="number"
                                name="discountPercent"
                                value={calcData.discountPercent}
                                onChange={handleChange}
                                placeholder="예: 5 (=5%)"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm mb-1 block" style={{ color: '#000000', fontWeight: '600' }}>택배비</label>
                            <input
                                type="number"
                                name="shippingFee"
                                value={calcData.shippingFee}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                        <div className="flex-1">
                            {/* Empty placeholder to keep layout balanced if needed, or remove */}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#000000' }}>
                        <div className="flex justify-between text-sm">
                            <span>수수료 (Fee):</span>
                            <span>- ₩{calcData.fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>배송비 (Ship):</span>
                            <span>- ₩{Number(calcData.shippingFee).toLocaleString()}</span>
                        </div>
                        {calcData.discountPercent > 0 && (
                            <div className="flex justify-between text-sm" style={{ color: '#2563eb' }}>
                                <span>할인 금액 ({calcData.discountPercent}%):</span>
                                <span>+ ₩{(Number(calcData.purchasePrice || 0) - Number(calcData.effectivePurchasePrice || 0)).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span>부가세 환급:</span>
                            <span className="text-green-600 font-bold">+ ₩{calcData.vatRefund.toLocaleString()}</span>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '0.25rem 0' }}></div>

                        <div className="flex justify-between font-bold text-lg">
                            <span>최종 마진:</span>
                            <span style={{ color: calcData.finalMargin > 0 ? '#10B981' : '#EF4444' }}>
                                ₩{calcData.finalMargin.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-muted">
                            <span>수익률 (ROI):</span>
                            <span>{calcData.roiPurchase}%</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setCalcData({ ...calcData, purchasePrice: '', sellPrice: '' })}
                        className="btn"
                        style={{ background: '#f3f4f6', color: '#4b5563', marginTop: '0.5rem' }}
                    >
                        초기화
                    </button>
                </div>
            </div>
        </div>
    );
}
