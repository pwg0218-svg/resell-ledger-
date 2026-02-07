import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InventoryItem } from './InventoryTable';
import { X, ShoppingBag } from 'lucide-react';

interface SellModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number) => void;
    item: InventoryItem | null;
}

export default function SellModal({ isOpen, onClose, onConfirm, item }: SellModalProps) {
    const [soldQty, setSoldQty] = useState<number | string>(1);

    if (!isOpen || !item) return null;

    const maxQty = item.quantity;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = Number(soldQty);
        if (qty > 0 && qty <= maxQty) {
            onConfirm(qty);
            setSoldQty(1); // Reset
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShoppingBag size={20} /> 판매 처리
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.brand} / {item.size}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">판매 수량 입력</label>
                        <div className="flex items-center gap-3 w-full justify-center">
                            <button
                                type="button"
                                onClick={() => setSoldQty(Math.max(1, Number(soldQty) - 1))}
                                className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all font-bold text-xl"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={soldQty}
                                onChange={(e) => setSoldQty(Math.min(maxQty, Math.max(1, Number(e.target.value))))}
                                className="w-20 text-center text-3xl font-extrabold bg-transparent border-none outline-none text-indigo-600"
                                min="1"
                                max={maxQty}
                            />
                            <button
                                type="button"
                                onClick={() => setSoldQty(Math.min(maxQty, Number(soldQty) + 1))}
                                className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all font-bold text-xl"
                            >
                                +
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                            현재 보유: {maxQty}개
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg shadow-indigo-200 shadow-lg">
                            {Number(soldQty) === maxQty ? '전체 판매 완료' : `${soldQty}개만 판매 (분할)`}
                        </Button>
                        <Button type="button" onClick={onClose} className="w-full text-gray-500 bg-transparent hover:bg-gray-100 h-12 font-bold">
                            취소
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
