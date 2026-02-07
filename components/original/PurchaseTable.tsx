import React, { useState } from 'react';

export interface PurchaseItem {
    id: string;
    date?: string;
    purchaseDate?: string;
    supplyPrice: number;
    vat: number;
    totalPrice: number;
    source: string;
    name: string;
    expenseType: 'merchandise' | 'shipping' | 'fee' | 'supplies' | 'other';
    proofType: 'tax_invoice' | 'card' | 'cash_receipt' | 'invoice_free' | 'simple_receipt';
    status: 'Purchased' | 'NotPaid'; // Assuming 'Purchased' means Paid
    imageUrl?: string;
    brand?: string;
    [key: string]: any;
}

interface PurchaseTableProps {
    items: PurchaseItem[];
    onEdit: (item: PurchaseItem) => void;
    onDelete: (id: string) => void;
    onStatusToggle: (id: string, currentStatus: string) => void;
}

export function PurchaseTable({ items, onEdit, onDelete, onStatusToggle }: PurchaseTableProps) {
    const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const formatPrice = (price: number) => `₩${Number(price).toLocaleString()}`;

    // Helper functions
    const getExpenseTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            'merchandise': '상품',
            'shipping': '택배',
            'fee': '수수료',
            'supplies': '비품',
            'other': '기타'
        };
        return types[type] || type || '기타';
    };

    const getProofBadge = (type: string) => {
        switch (type) {
            case 'tax_invoice': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">세금계산서</span>;
            case 'card': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-200">카드전표</span>;
            case 'cash_receipt': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">현금영수증</span>;
            case 'invoice_free': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">계산서(면세)</span>;
            case 'simple_receipt': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">간이영수증</span>;
            default: return <span className="text-gray-400 text-xs">-</span>;
        }
    };

    const getWeekNumber = (d: Date) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}년 ${weekNo}주차`;
    };

    const getGroupedItems = () => {
        const sortedItems = [...items].sort((a, b) => new Date(b.date || b.purchaseDate || 0).getTime() - new Date(a.date || a.purchaseDate || 0).getTime());

        if (viewMode === 'all') return { '전체 내역': sortedItems };

        return sortedItems.reduce((groups: { [key: string]: PurchaseItem[] }, item) => {
            const dateStr = item.date || item.purchaseDate;
            if (!dateStr) return groups;

            const date = new Date(dateStr);
            let key = '';

            if (viewMode === 'daily') {
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                key = `${dateStr} (${dayNames[date.getDay()]})`;
            } else if (viewMode === 'weekly') {
                key = getWeekNumber(date);
            } else if (viewMode === 'monthly') {
                key = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {});
    };

    const groupedItems = getGroupedItems();
    const totalAllSupply = items.reduce((acc, item) => acc + (Number(item.supplyPrice) || 0), 0);
    const totalAllVat = items.reduce((acc, item) => acc + (Number(item.vat) || 0), 0);
    const totalAllSum = items.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="glass-panel p-3 md:p-4 flex flex-row md:flex-col items-center justify-between md:justify-center bg-blue-50/50 border-blue-100">
                    <span className="text-sm text-blue-600 font-medium">총 공급가액</span>
                    <span className="text-lg md:text-xl font-bold text-gray-800">{formatPrice(totalAllSupply)}</span>
                </div>
                <div className="glass-panel p-3 md:p-4 flex flex-row md:flex-col items-center justify-between md:justify-center bg-red-50/50 border-red-100">
                    <span className="text-sm text-red-600 font-medium">부가세(환급)</span>
                    <span className="text-lg md:text-xl font-bold text-red-600">{formatPrice(totalAllVat)}</span>
                </div>
                <div className="glass-panel p-3 md:p-4 flex flex-row md:flex-col items-center justify-between md:justify-center bg-gray-50/50 border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">총 매입 합계</span>
                    <span className="text-lg md:text-xl font-bold text-gray-900">{formatPrice(totalAllSum)}</span>
                </div>
            </div>

            <div className="overflow-x-auto pb-2 md:pb-0">
                <div className="flex bg-gray-100 p-1 rounded-lg w-fit whitespace-nowrap">
                    {(['daily', 'weekly', 'monthly', 'all'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1.5 md:px-4 md:py-1.5 rounded-md text-xs md:text-sm font-bold transition-all ${viewMode === mode
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {mode === 'daily' && '일별 보기'}
                            {mode === 'weekly' && '주별 보기'}
                            {mode === 'monthly' && '월별 보기'}
                            {mode === 'all' && '전체 보기'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel !p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="p-3 text-left font-bold text-gray-600">날짜</th>
                            <th className="p-3 text-left font-bold text-gray-600">구분</th>
                            <th className="p-3 text-left font-bold text-gray-600">증빙</th>
                            <th className="p-3 text-left font-bold text-gray-600">거래처</th>
                            <th className="p-3 text-left font-bold text-gray-600">품목</th>
                            <th className="p-3 text-right font-bold text-gray-600">공급가액</th>
                            <th className="p-3 text-right font-bold text-gray-600">부가세</th>
                            <th className="p-3 text-right font-bold text-indigo-600">합계</th>
                            <th className="p-3 text-center font-bold text-gray-600">상태</th>
                            <th className="p-3 text-center font-bold text-gray-600">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedItems).length === 0 ? (
                            <tr><td colSpan={10} className="p-8 text-center text-gray-400">내역이 없습니다.</td></tr>
                        ) : (
                            Object.entries(groupedItems).map(([groupKey, groupItems]) => {
                                const groupSupply = groupItems.reduce((acc, i) => acc + (Number(i.supplyPrice) || 0), 0);
                                const groupVat = groupItems.reduce((acc, i) => acc + (Number(i.vat) || 0), 0);
                                const groupSum = groupItems.reduce((acc, i) => acc + (Number(i.totalPrice) || 0), 0);

                                return (
                                    <React.Fragment key={groupKey}>
                                        {viewMode !== 'all' && (
                                            <tr className="bg-gray-50 border-y border-gray-200">
                                                <td colSpan={10} className="px-4 py-2 font-bold text-gray-700">📅 {groupKey}</td>
                                            </tr>
                                        )}
                                        {groupItems.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
                                                <td className="p-3 font-medium">{item.date || item.purchaseDate}</td>
                                                <td className="p-3">{getExpenseTypeLabel(item.expenseType)}</td>
                                                <td className="p-3">{getProofBadge(item.proofType)}</td>
                                                <td className="p-3 font-bold text-gray-800">{item.source}</td>
                                                <td className="p-3">
                                                    <div className="font-bold text-gray-800">{item.name}</div>
                                                    {item.imageUrl && <span className="text-xs text-blue-500 cursor-pointer" onClick={() => setPreviewImage(item.imageUrl || '')}>📷 사진</span>}
                                                </td>
                                                <td className="p-3 text-right">{formatPrice(item.supplyPrice)}</td>
                                                <td className="p-3 text-right text-red-500">{formatPrice(item.vat)}</td>
                                                <td className="p-3 text-right font-bold">{formatPrice(item.totalPrice)}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs ${item.status === 'Purchased' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {item.status === 'Purchased' ? '구매완료' : '미지급'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button onClick={() => onEdit(item)} className="mr-2 text-blue-500">✏️</button>
                                                    <button onClick={() => onDelete(item.id)} className="text-red-500">🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {viewMode !== 'all' && (
                                            <tr className="bg-blue-50/30 border-t border-blue-100 font-bold text-xs">
                                                <td colSpan={5} className="p-2 text-right">소계</td>
                                                <td className="p-2 text-right">{formatPrice(groupSupply)}</td>
                                                <td className="p-2 text-right text-red-500">{formatPrice(groupVat)}</td>
                                                <td className="p-2 text-right text-blue-800">{formatPrice(groupSum)}</td>
                                                <td colSpan={2}></td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setPreviewImage(null)}>
                    <img src={previewImage} alt="Receipt" className="max-w-full max-h-[90vh] rounded" />
                </div>
            )}
        </div>
    );
}
