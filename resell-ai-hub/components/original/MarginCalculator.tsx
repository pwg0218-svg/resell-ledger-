import React, { useState, useEffect } from 'react';
import { calculateMargin } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MarginCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MarginCalculator({ isOpen, onClose }: MarginCalculatorProps) {
    const [calcData, setCalcData] = useState({
        purchasePrice: '',
        sellPrice: '',
        discountPercent: '',
        shippingFee: '3000',
        fee: '', // Now editable
        vatRefund: 0,
        basicMargin: 0,
        finalMargin: 0,
        roiPurchase: 0,
        effectivePurchasePrice: 0,
        quantity: 1, // New: Quantity
        totalPurchaseCost: 0 // New: Total Purchase Cost
    });

    useEffect(() => {
        if (isOpen) {
            const percent = Number(calcData.discountPercent) || 0;
            const discountMultiplier = 1 - (percent / 100);

            // If fee is empty, we use auto-calc in the background OR we interpret empty as "Auto"
            // But here we want to show the calculated fee if the user hasn't typed one.
            // Actually, to support "Manual Override", we pass the manually typed fee. 
            // If it is empty string, the utility calculates auto fee.

            const result = calculateMargin({
                buyPrice: calcData.purchasePrice,
                sellPrice: calcData.sellPrice,
                shippingFee: calcData.shippingFee,
                discountRate: discountMultiplier,
                applyDiscount: percent > 0,
                saleType: 'export',
                manualFee: calcData.fee // Pass the manual input
            });

            setCalcData(prev => ({
                ...prev,
                vatRefund: result.vatRefund,
                basicMargin: result.basicMargin,
                finalMargin: result.finalMargin,
                roiPurchase: Number(result.roiPurchase),
                effectivePurchasePrice: result.effectivePurchasePrice,
                totalPurchaseCost: result.effectivePurchasePrice * (Number(prev.quantity) || 1)
            }));
        }
    }, [calcData.purchasePrice, calcData.sellPrice, calcData.shippingFee, calcData.discountPercent, calcData.fee, calcData.quantity, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCalcData(prev => ({ ...prev, [name]: value }));
    };

    // Helper to calculate what the Auto Fee WOULD be, for placeholder
    const getAutoFee = () => {
        const sell = Number(calcData.sellPrice) || 0;
        return Math.floor(sell * 0.1).toLocaleString();
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 bg-white/50 border-b border-gray-100">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        ⚡ 마진 계산기 (자율 수수료)
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-[2] space-y-1">
                            <label className="text-xs font-bold text-gray-500">구매가</label>
                            <input
                                type="number"
                                name="purchasePrice"
                                value={calcData.purchasePrice}
                                onChange={handleChange}
                                placeholder="구매 가격"
                                className="w-full text-lg font-bold p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                autoFocus
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-bold text-gray-500">할인율(%)</label>
                            <input
                                type="number"
                                name="discountPercent"
                                value={calcData.discountPercent}
                                onChange={handleChange}
                                placeholder="0%"
                                className="w-full text-lg font-bold p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-center text-blue-600"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-[2] space-y-1">
                            <label className="text-xs font-bold text-gray-500">판매가 (예상)</label>
                            <input
                                type="number"
                                name="sellPrice"
                                value={calcData.sellPrice}
                                onChange={handleChange}
                                placeholder="판매 가격"
                                className="w-full text-lg font-bold p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-bold text-gray-500">수량</label>
                            <input
                                type="number"
                                name="quantity"
                                value={calcData.quantity}
                                onChange={handleChange}
                                placeholder="1"
                                min="1"
                                className="w-full text-lg font-bold p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-bold text-gray-500">수수료 (직접 입력 가능)</label>
                            <input
                                type="number"
                                name="fee"
                                value={calcData.fee}
                                onChange={handleChange}
                                placeholder={`예상: ${getAutoFee()}`}
                                className={`w-full p-2 border rounded bg-white font-medium ${calcData.fee ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                            />
                            <p className="text-[10px] text-gray-400 text-right">빈칸이면 자동(10%) 적용</p>
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-bold text-gray-500">배송비</label>
                            <input
                                type="number"
                                name="shippingFee"
                                value={calcData.shippingFee}
                                onChange={handleChange}
                                className="w-full p-2 border rounded bg-white font-medium"
                            />
                        </div>
                    </div>

                    {/* Result Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-4 rounded-xl space-y-2 shadow-sm">
                        <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg mb-2">
                            <span className="font-bold text-indigo-900 text-sm">총 매입금 (수량 {calcData.quantity}개)</span>
                            <span className="font-bold text-indigo-700 text-lg">₩{Number(calcData.totalPurchaseCost).toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between text-sm text-gray-600">
                            <span>총 예상 수수료</span>
                            <span className="text-red-500 font-medium">- ₩{((Number(calcData.fee) || Math.floor(Number(calcData.sellPrice) * 0.1)) * (Number(calcData.quantity) || 1)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>총 배송비</span>
                            <span className="text-red-500">- ₩{(Number(calcData.shippingFee) * (Number(calcData.quantity) || 1)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>총 부가세 환급</span>
                            <span className="text-emerald-600 font-bold">+ ₩{(calcData.vatRefund * (Number(calcData.quantity) || 1)).toLocaleString()}</span>
                        </div>

                        <div className="my-2 border-t border-gray-100"></div>

                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800">총 최종 마진</span>
                            <div className="text-right">
                                <div className={`text-2xl font-extrabold ${calcData.finalMargin > 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                                    ₩{(calcData.finalMargin * (Number(calcData.quantity) || 1)).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400 font-bold">
                                    ROI: {calcData.roiPurchase}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => setCalcData(prev => ({ ...prev, purchasePrice: '', sellPrice: '', fee: '' }))}
                        variant="outline"
                        className="w-full"
                    >
                        초기화
                    </Button>
                </div>
            </div>
        </div>
    );
}
