import React, { useState, useEffect } from 'react';
import { calculateMargin } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { InventoryItem } from './InventoryTable';
import { X } from 'lucide-react';

interface ItemFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<InventoryItem, 'id'>) => void;
    initialData?: InventoryItem | null;
}

export default function ItemForm({ isOpen, onClose, onSubmit, initialData }: ItemFormProps) {
    const [formData, setFormData] = useState<any>({
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
        fee: '', // Manual Fee
        status: 'Selling',
        cardCompany: '',
        quantity: 1,
        soldQuantity: 0,
        saleType: 'export',
        channels: [] // New: Multi-Channel Support
    });

    useEffect(() => {
        if (isOpen) {
            // Merge defaults with initialData to ensure no field is undefined
            const defaultValues = {
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
                fee: '',
                status: 'Selling',
                cardCompany: '',
                quantity: 1,
                soldQuantity: 0,
                saleType: 'export',
                channels: []
            };

            if (initialData) {
                setFormData({
                    ...defaultValues,
                    ...initialData,
                    // Explicitly safeguard arrays/objects if they might be missing in legacy data
                    channels: initialData.channels || [],
                    fee: initialData.fee || ''
                });
            } else {
                setFormData(defaultValues);
            }
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleChannelChange = (channel: string) => {
        setFormData((prev: any) => {
            const currentChannels = prev.channels || [];
            if (currentChannels.includes(channel)) {
                return { ...prev, channels: currentChannels.filter((c: string) => c !== channel) };
            } else {
                return { ...prev, channels: [...currentChannels, channel] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const margin = calculateMargin({
            buyPrice: formData.purchasePrice,
            sellPrice: formData.sellPrice,
            shippingFee: formData.shippingFee,
            saleType: formData.saleType,
            manualFee: formData.fee
        });

        onSubmit({
            ...formData,
            ...margin
        });
        onClose();
    };

    if (!isOpen) return null;

    const marginPreview = calculateMargin({
        buyPrice: formData.purchasePrice,
        sellPrice: formData.sellPrice,
        shippingFee: formData.shippingFee,
        saleType: formData.saleType,
        manualFee: formData.fee
    });

    // Auto-Fee Display for placeholder
    const autoFee = Math.floor((Number(formData.sellPrice) || 0) * 0.1).toLocaleString();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? '상품 정보 수정' : '새 상품 추가'}
                    </h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">브랜드</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Nike" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">모델명</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Dunk Low" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">KR 사이즈</label>
                            <input type="number" name="sizeKr" value={formData.sizeKr} onChange={handleChange} className="w-full p-2 border rounded" placeholder="270" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">표기 사이즈</label>
                            <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full p-2 border rounded" placeholder="US 9" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">수량</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2 border rounded text-center" min="1" required />
                        </div>
                    </div>

                    {/* Channel Selection */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="text-xs font-bold text-gray-500 block mb-2">판매 채널 (Multi-Channel)</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.channels?.includes('Poizon')}
                                    onChange={() => handleChannelChange('Poizon')}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-bold text-gray-700">🌏 Poizon</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.channels?.includes('KREAM')}
                                    onChange={() => handleChannelChange('KREAM')}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-bold text-gray-700">🇰🇷 크림/국내</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.channels?.includes('Naver')}
                                    onChange={() => handleChannelChange('Naver')}
                                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                />
                                <span className="text-sm font-bold text-gray-700">✅ 스마트스토어</span>
                            </label>
                        </div>
                    </div>

                    {/* Price & Calculation */}
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-indigo-900">구매가</label>
                                <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="w-full p-2 border border-indigo-200 rounded text-right font-bold" required />
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-indigo-900">판매가</label>
                                <input type="number" name="sellPrice" value={formData.sellPrice} onChange={handleChange} className="w-full p-2 border border-indigo-200 rounded text-right font-bold" required />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-gray-500">수수료 (직접입력)</label>
                                <input
                                    type="number"
                                    name="fee"
                                    value={formData.fee}
                                    onChange={handleChange}
                                    placeholder={`기본: ${autoFee}`}
                                    className={`w-full p-2 border rounded text-right font-medium ${formData.fee ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-indigo-200'}`}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-gray-500">배송비</label>
                                <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} className="w-full p-2 border border-indigo-200 rounded text-right font-medium" />
                            </div>
                        </div>

                        {/* Live Margin Preview */}
                        <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
                            <div className="text-xs text-indigo-700 font-medium">
                                {formData.fee ? '수동 수수료 적용' : '자동 수수료(10%) 적용'}
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-indigo-500 font-bold mb-1">최종 마진(예상)</div>
                                <div className={`text-xl font-extrabold ${marginPreview.finalMargin > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {marginPreview.finalMargin > 0 ? '+' : ''}{marginPreview.finalMargin.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">판매 유형</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${formData.saleType === 'export' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <input type="radio" name="saleType" value="export" checked={formData.saleType === 'export'} onChange={handleChange} className="hidden" />
                                <div className="text-center font-bold text-sm">✈️ 수출 (환급 O)</div>
                            </label>
                            <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all ${formData.saleType === 'domestic' ? 'bg-amber-500 text-white border-amber-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                <input type="radio" name="saleType" value="domestic" checked={formData.saleType === 'domestic'} onChange={handleChange} className="hidden" />
                                <div className="text-center font-bold text-sm">🏠 국내 (일반)</div>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" onClick={onClose} variant="ghost" className="flex-1">취소</Button>
                        <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                            {initialData ? '수정 완료' : '상품 추가'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
