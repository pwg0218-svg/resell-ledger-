import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Original Styles from InventoryTable.jsx
const thStyle: React.CSSProperties = {
    padding: '0.75rem 0.6rem',
    color: '#374151',
    fontWeight: 700,
    fontSize: '0.8rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid rgba(0,0,0,0.1)',
    background: 'rgba(249, 250, 251, 0.95)'
};

const tdStyle: React.CSSProperties = {
    padding: '0.65rem 0.6rem',
    whiteSpace: 'nowrap',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#111827' // Restoring original text color
};

// Original Group Colors
const groupColors = [
    'rgba(59, 130, 246, 0.08)',   // Blue
    'rgba(16, 185, 129, 0.08)',   // Green
    'rgba(139, 92, 246, 0.08)',   // Purple
    'rgba(245, 158, 11, 0.08)',   // Orange
    'rgba(239, 68, 68, 0.08)',    // Red
    'rgba(20, 184, 166, 0.08)',   // Teal
    'rgba(236, 72, 153, 0.08)',   // Pink
    'rgba(99, 102, 241, 0.08)',   // Indigo
];

export interface InventoryItem {
    id: string | number;
    status: 'Selling' | 'Sold' | string; // Allow string for legacy compatibility
    saleType: 'domestic' | 'export' | string;
    quantity: number;
    soldQuantity?: number;
    imageUrl?: string;
    brand: string;
    name: string;
    size: string;
    sizeKr?: string;
    productNumber?: string;
    purchaseLink?: string;
    purchasePrice: number | string; // Allow string handling for inputs
    paymentMethod: string;
    cardCompany?: string;
    sellPrice: number | string;
    fee: number | string;
    shippingFee: number | string;
    basicMargin: number;
    vatRefund: number;
    finalMargin: number;
    roiPurchase: string;
    roiSell: string;
    channels?: string[];
    date?: string; // Add missing date field
    [key: string]: any;
}

interface InventoryTableProps {
    items: InventoryItem[];
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string | number) => void;
    onStatusToggle: (item: InventoryItem) => void;
    onCopy: (item: InventoryItem) => void;
}

export function InventoryTable({ items, onEdit, onDelete, onStatusToggle, onCopy }: InventoryTableProps) {

    // Grouping Logic
    const getGroupedItems = () => {
        const groups: { [key: string]: InventoryItem[] } = {};
        (items || []).forEach(item => {
            const key = item.name || 'Unknown';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });
        return groups;
    };

    const groupedItems = getGroupedItems();
    const modelNames = Object.keys(groupedItems);

    const getGroupColor = (modelName: string) => {
        const index = modelNames.indexOf(modelName);
        return groupColors[index % groupColors.length];
    };

    const getTotalQuantity = (items: InventoryItem[]) => items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
    const formatPrice = (price: number | string) => `₩${Number(price).toLocaleString()}`;

    // Export Logic
    // Export Logic (Fixed for Korean Encoding with BOM)
    const handleExport = () => {
        const headers = ['Brand', 'ModelName', 'Size', 'SizeKR', 'Price', 'Fee', 'Margin', 'Channels'];
        const rows = (items || []).map(item => [
            item.brand,
            item.name,
            item.size,
            item.sizeKr || '',
            item.sellPrice,
            item.fee,
            item.finalMargin,
            (item.channels || []).join(' / ')
        ].join(','));

        const csvString = [headers.join(','), ...rows].join('\n');

        // Add BOM (\uFEFF) to tell Excel this is UTF-8
        const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "resell_inventory_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--text-main)' }}>재고 목록</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button onClick={handleExport} className="gap-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-sm h-9 px-3 rounded-md text-sm font-medium">
                        <Download size={14} /> 엑셀 내보내기
                    </Button>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', background: 'rgba(255,255,255,0.5)', padding: '4px 10px', borderRadius: '12px' }}>
                        📦 {modelNames.length}개 모델
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 600 }}>총 {items.length}개</span>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', tableLayout: 'auto' }}>
                    <thead>
                        <tr style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)' }}>
                            <th style={{ ...thStyle, minWidth: '70px' }}>상태</th>
                            <th style={{ ...thStyle, minWidth: '65px' }}>채널</th>
                            <th style={{ ...thStyle, minWidth: '45px' }}>수량</th>
                            <th style={{ ...thStyle, minWidth: '45px' }}>사진</th>
                            <th style={{ ...thStyle, minWidth: '70px', textAlign: 'left' }}>브랜드</th>
                            <th style={{ ...thStyle, minWidth: '100px', textAlign: 'left' }}>모델명</th>
                            <th style={{ ...thStyle, minWidth: '90px' }}>사이즈</th>
                            <th style={{ ...thStyle, minWidth: '55px' }}>KR</th>
                            <th style={{ ...thStyle, minWidth: '55px' }}>품번</th>
                            <th style={{ ...thStyle, minWidth: '40px' }}>링크</th>
                            <th style={{ ...thStyle, minWidth: '80px', textAlign: 'right' }}>구매가</th>
                            <th style={{ ...thStyle, minWidth: '60px' }}>결제</th>
                            <th style={{ ...thStyle, minWidth: '80px', textAlign: 'right' }}>판매가</th>
                            <th style={{ ...thStyle, minWidth: '75px', textAlign: 'right' }}>수수료</th>
                            <th style={{ ...thStyle, minWidth: '65px', textAlign: 'right' }}>배송비</th>
                            <th style={{ ...thStyle, minWidth: '80px', textAlign: 'right' }}>기본마진</th>
                            <th style={{ ...thStyle, minWidth: '70px', textAlign: 'right' }}>부가세</th>
                            <th style={{ ...thStyle, minWidth: '85px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>최종마진</th>
                            <th style={{ ...thStyle, minWidth: '55px', textAlign: 'right' }}>구매%</th>
                            <th style={{ ...thStyle, minWidth: '55px', textAlign: 'right' }}>판매%</th>
                            <th style={{ ...thStyle, minWidth: '75px' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={21} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    재고가 없습니다. 첫 아이템을 등록해보세요!
                                </td>
                            </tr>
                        ) : (
                            Object.entries(groupedItems).map(([modelName, groupItems], groupIndex) => (
                                <React.Fragment key={modelName}>
                                    {groupItems.length > 1 && (
                                        <tr style={{
                                            background: getGroupColor(modelName),
                                            borderTop: '2px solid rgba(0,0,0,0.1)'
                                        }}>
                                            <td colSpan={21} style={{
                                                padding: '6px 12px',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                color: '#374151'
                                            }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{
                                                        background: 'rgba(255,255,255,0.5)',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800
                                                    }}>
                                                        x{getTotalQuantity(groupItems)}
                                                    </span>
                                                    📦 {modelName}
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                    {groupItems.map((item, index) => {
                                        const isSold = item.status === 'Sold';
                                        const baseBackground = groupItems.length > 1
                                            ? getGroupColor(modelName)
                                            : (index % 2 === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(249,250,251,0.4)');
                                        const soldBackground = 'rgba(16, 185, 129, 0.15)';

                                        return (
                                            <tr
                                                key={item.id}
                                                style={{
                                                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    background: isSold ? soldBackground : baseBackground,
                                                    opacity: isSold ? 0.7 : 1,
                                                    borderLeft: groupItems.length > 1
                                                        ? `3px solid ${groupColors[groupIndex % groupColors.length].replace('0.08', '0.5')}`
                                                        : (isSold ? '3px solid #10B981' : 'none')
                                                }}
                                            >
                                                <td style={{ padding: '0.75rem' }}>
                                                    <button
                                                        onClick={() => onStatusToggle(item)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            background: item.status === 'Sold' ? 'var(--secondary)' : 'var(--primary)',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {item.status === 'Sold' ? '판매완료' : '판매중'}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <div className="flex flex-col gap-1">
                                                        {item.channels?.includes('Poizon') && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded">Poizon</span>}
                                                        {item.channels?.includes('KREAM') && <span className="text-[10px] bg-gray-100 text-gray-700 px-1 rounded">KREAM</span>}
                                                        {item.saleType === 'domestic' && !item.channels?.includes('KREAM') && <span className="text-[10px] text-amber-600">국내</span>}
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>{item.quantity}</td>
                                                <td style={tdStyle}>{item.imageUrl ? '📷' : '-'}</td>
                                                <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--text-muted)' }}>{item.brand}</td>
                                                <td style={{ ...tdStyle, textAlign: 'left' }}>{item.name}</td>
                                                <td style={tdStyle}>{item.size}</td>
                                                <td style={tdStyle}>{item.sizeKr || '-'}</td>
                                                <td style={tdStyle}>{item.productNumber || '-'}</td>
                                                <td style={tdStyle}>{item.purchaseLink ? '🔗' : '-'}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatPrice(item.purchasePrice)}</td>
                                                <td style={tdStyle}>{item.paymentMethod}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatPrice(item.sellPrice)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: '#EF4444' }}>-{formatPrice((Number(item.fee) || 0) * (Number(item.quantity) || 1))}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: '#EF4444' }}>{formatPrice((Number(item.shippingFee) || 0) * (Number(item.quantity) || 1))}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatPrice((Number(item.basicMargin) || 0) * (Number(item.quantity) || 1))}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: '#10B981' }}>+{formatPrice((Number(item.vatRefund) || 0) * (Number(item.quantity) || 1))}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#10B981' }}>{formatPrice((Number(item.finalMargin) || 0) * (Number(item.quantity) || 1))}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{item.roiSell}%</td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => onCopy(item)} className="mr-2" title="복제하기">📄</button>
                                                    <button onClick={() => onEdit(item)} className="mr-2" title="수정하기">✏️</button>
                                                    <button onClick={() => onDelete(item.id)} title="삭제하기">🗑️</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
