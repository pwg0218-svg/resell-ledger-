import React, { useState, useRef, useEffect } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button'; // Re-use UI components
import { PurchaseItem } from './PurchaseTable';
import { v4 as uuidv4 } from 'uuid';

interface PurchaseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<PurchaseItem, 'id'>) => Promise<void>;
    initialData?: PurchaseItem | null;
}

export default function PurchaseForm({ isOpen, onClose, onSubmit, initialData }: PurchaseFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState<any>({
        purchaseDate: new Date().toISOString().split('T')[0],
        expenseType: 'merchandise',
        proofType: 'card',
        totalPrice: '',
        supplyPrice: '',
        vat: '',
        source: '',
        name: '',
        brand: '',
        size: '',
        imageUrl: '',
        status: 'Purchased'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    purchaseDate: new Date().toISOString().split('T')[0],
                    expenseType: 'merchandise',
                    proofType: 'card',
                    totalPrice: '',
                    supplyPrice: '',
                    vat: '',
                    source: '',
                    name: '',
                    brand: '',
                    size: '',
                    imageUrl: '',
                    status: 'Purchased'
                });
            }
        }
    }, [isOpen, initialData]);

    // Handle Total Price Change -> Auto Calculate Supply/VAT
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const total = Number(e.target.value);
        setFormData((prev: any) => ({
            ...prev,
            totalPrice: total,
            supplyPrice: Math.round(total / 1.1),
            vat: total - Math.round(total / 1.1)
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `receipts/${uuidv4()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData((prev: any) => ({ ...prev, imageUrl: downloadURL }));

            // Note: OCR/AI Analysis would go here if we had the backend API
            // For now, we just upload the image.
        } catch (error) {
            console.error("Upload failed", error);
            alert("이미지 업로드에 실패했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{initialData ? '매입 내역 수정' : '새 매입 내역 등록'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <label className="block text-sm font-bold text-gray-700 mb-2">📸 영수증 사진</label>
                        <div className="flex gap-4 items-start">
                            {formData.imageUrl ? (
                                <div className="relative">
                                    <img src={formData.imageUrl} alt="Receipt" className="w-24 h-24 object-cover rounded-lg" />
                                    <button type="button" onClick={() => setFormData((p: any) => ({ ...p, imageUrl: '' }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">✕</button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    📷
                                </div>
                            )}

                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Button type="button" onClick={() => cameraInputRef.current?.click()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                                        카메라 촬영
                                    </Button>
                                    <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                                        갤러리 선택
                                    </Button>
                                </div>
                                <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                                <p className="text-xs text-gray-500">{isUploading ? '업로드 중...' : '영수증을 찍으면 자동으로 저장됩니다.'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">거래일자</label>
                            <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">지출 구분</label>
                            <select name="expenseType" value={formData.expenseType} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="merchandise">상품 매입</option>
                                <option value="shipping">운반/택배비</option>
                                <option value="fee">수수료</option>
                                <option value="supplies">소모품/비품</option>
                                <option value="other">기타 비용</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-sm font-bold text-blue-900 mb-1">합계 금액 (Total)</label>
                        <input type="number" name="totalPrice" value={formData.totalPrice} onChange={handlePriceChange} className="w-full p-3 text-2xl font-bold text-right border border-blue-200 rounded" placeholder="0" required />
                        <div className="flex gap-4 mt-2 text-xs text-gray-500 justify-end">
                            <span>공급가: {Number(formData.supplyPrice).toLocaleString()}</span>
                            <span>부가세: {Number(formData.vat).toLocaleString()}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">거래처명</label>
                        <input type="text" name="source" value={formData.source} onChange={handleChange} className="w-full p-2 border rounded" placeholder="예: Nike 강남" required />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">품목명</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" placeholder="예: Dunk Low Retro" required />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">취소</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                            {initialData ? '수정 완료' : '등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
