import React from 'react';
import { calculateMargin } from '../utils/calculations';

const thStyle = {
    padding: '0.75rem 0.6rem',
    color: '#374151',
    fontWeight: 700,
    fontSize: '0.8rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid rgba(0,0,0,0.1)',
    background: 'rgba(249, 250, 251, 0.95)'
};

const tdStyle = {
    padding: '0.65rem 0.6rem',
    whiteSpace: 'nowrap',
    fontSize: '0.85rem',
    fontWeight: 500
};

// 그룹 색상 팔레트
const groupColors = [
    'rgba(59, 130, 246, 0.08)',   // 파랑
    'rgba(16, 185, 129, 0.08)',   // 초록
    'rgba(139, 92, 246, 0.08)',   // 보라
    'rgba(245, 158, 11, 0.08)',   // 주황
    'rgba(239, 68, 68, 0.08)',    // 빨강
    'rgba(20, 184, 166, 0.08)',   // 청록
    'rgba(236, 72, 153, 0.08)',   // 핑크
    'rgba(99, 102, 241, 0.08)',   // 인디고
];

export default function InventoryTable({ items, onEdit, onDelete, onStatusToggle, onCopy }) {
    // 동일 모델명(name)으로 그룹화
    const getGroupedItems = () => {
        const groups = {};
        items.forEach(item => {
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

    // 모델명별 색상 맵핑
    const getGroupColor = (modelName) => {
        const index = modelNames.indexOf(modelName);
        return groupColors[index % groupColors.length];
    };

    // 같은 모델 수량 합계
    const getTotalQuantity = (items) => items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);

    return (
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>재고 목록</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '12px' }}>
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
                            <th style={{ ...thStyle, minWidth: '65px' }}>유형</th>
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
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="20" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    재고가 없습니다. 첫 아이템을 등록해보세요!
                                </td>
                            </tr>
                        ) : (
                            Object.entries(groupedItems).map(([modelName, groupItems], groupIndex) => (
                                <React.Fragment key={modelName}>
                                    {/* 그룹 헤더 (2개 이상일 때만 표시) */}
                                    {groupItems.length > 1 && (
                                        <tr style={{
                                            background: getGroupColor(modelName),
                                            borderTop: '2px solid rgba(0,0,0,0.1)'
                                        }}>
                                            <td colSpan="20" style={{
                                                padding: '6px 12px',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                color: '#374151'
                                            }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}>
                                                    <span style={{
                                                        background: 'rgba(0,0,0,0.08)',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800
                                                    }}>
                                                        x{getTotalQuantity(groupItems)}
                                                    </span>
                                                    📦 {modelName}
                                                    {/* 판매중/판매완료 구분 */}
                                                    <span style={{ display: 'inline-flex', gap: '6px', marginLeft: '8px' }}>
                                                        <span style={{
                                                            background: 'var(--primary)',
                                                            color: 'white',
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            fontSize: '0.68rem',
                                                            fontWeight: 700
                                                        }}>
                                                            판매중 {groupItems.filter(i => i.status !== 'Sold').reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)}
                                                        </span>
                                                        <span style={{
                                                            background: 'var(--secondary)',
                                                            color: 'white',
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            fontSize: '0.68rem',
                                                            fontWeight: 700
                                                        }}>
                                                            완료 {groupItems.filter(i => i.status === 'Sold').reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)}
                                                        </span>
                                                    </span>
                                                </span>
                                            </td>
                                        </tr>
                                    )}
                                    {groupItems.map((item, index) => {
                                        const isSold = item.status === 'Sold';
                                        const baseBackground = groupItems.length > 1
                                            ? getGroupColor(modelName)
                                            : (index % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(249,250,251,0.6)');
                                        const soldBackground = 'rgba(16, 185, 129, 0.15)'; // 판매완료 녹색 배경

                                        return (
                                            <tr
                                                key={item.id}
                                                style={{
                                                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    background: isSold ? soldBackground : baseBackground,
                                                    opacity: isSold ? 0.7 : 1,
                                                    transition: 'all 0.15s ease',
                                                    borderLeft: groupItems.length > 1
                                                        ? `3px solid ${groupColors[groupIndex % groupColors.length].replace('0.08', '0.5')}`
                                                        : (isSold ? '3px solid #10B981' : 'none')
                                                }}
                                                onClick={() => onEdit(item)}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,246,255,0.9)'; e.currentTarget.style.opacity = 1; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = isSold ? soldBackground : baseBackground; e.currentTarget.style.opacity = isSold ? 0.7 : 1; }}
                                            >
                                                {/* 1. Status */}
                                                <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => onStatusToggle(item.id, item.status)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            background: item.status === 'Sold' ? 'var(--secondary)' : 'var(--primary)',
                                                            color: 'white',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}
                                                    >
                                                        {item.status === 'Sold' ? '판매완료' : '판매중'}
                                                    </button>
                                                </td>

                                                {/* 1.5 Type (Export/Domestic) */}
                                                <td style={{ padding: '0.75rem' }}>
                                                    {item.saleType === 'domestic' ? (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            background: 'rgba(245, 158, 11, 0.15)',
                                                            color: '#D97706',
                                                            fontWeight: 700
                                                        }}>국내</span>
                                                    ) : (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            background: 'rgba(59, 130, 246, 0.15)',
                                                            color: '#2563EB',
                                                            fontWeight: 700
                                                        }}>수출</span>
                                                    )}
                                                </td>

                                                {/* 2. Quantity */}
                                                <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                                                    {Number(item.quantity) > 1 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '2px',
                                                                fontWeight: 700,
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                <span style={{ color: '#10B981' }}>{item.soldQuantity || 0}</span>
                                                                <span style={{ color: '#9CA3AF' }}>/</span>
                                                                <span>{item.quantity}</span>
                                                            </div>
                                                            {/* 진행 바 */}
                                                            <div style={{
                                                                width: '40px',
                                                                height: '4px',
                                                                background: 'rgba(0,0,0,0.1)',
                                                                borderRadius: '2px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: `${((item.soldQuantity || 0) / item.quantity) * 100}%`,
                                                                    height: '100%',
                                                                    background: (item.soldQuantity || 0) >= item.quantity ? '#10B981' : '#3B82F6',
                                                                    transition: 'width 0.3s ease'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            display: 'inline-block',
                                                            padding: '0.2rem 0.6rem',
                                                            background: 'rgba(255,255,255,0.1)',
                                                            borderRadius: '12px',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            {item.quantity || 1}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* 3. Image */}
                                                <td style={{ padding: '0.75rem' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden',
                                                        background: item.imageUrl ? 'none' : 'rgba(255,255,255,0.1)',
                                                        margin: '0 auto',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <span style={{ fontSize: '0.8rem' }}>👟</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* 4. Brand */}
                                                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{item.brand}</td>

                                                {/* 5. Name (Model) */}
                                                <td style={{ padding: '0.75rem', fontWeight: 500 }}>{item.name}</td>

                                                {/* 6. Size */}
                                                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{item.size}</td>

                                                {/* 7. Size KR */}
                                                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{item.sizeKr || '-'}</td>

                                                {/* 8. SKU */}
                                                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{item.productNumber || '-'}</td>

                                                {/* 9. Link */}
                                                <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                                                    {item.purchaseLink ? (
                                                        <a href={item.purchaseLink} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'none' }}>
                                                            🔗
                                                        </a>
                                                    ) : '-'}
                                                </td>

                                                {/* 10. Purchase Price */}
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>₩{Number(item.purchasePrice).toLocaleString()}</td>

                                                {/* 11. Payment Info */}
                                                <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                                                    {item.paymentMethod === '카드' ? (
                                                        <span style={{ color: '#8B5CF6', fontWeight: 500 }}>
                                                            카드{item.cardCompany ? `(${item.cardCompany})` : ''}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)' }}>현금</span>
                                                    )}
                                                </td>

                                                {/* 12. Sell Price */}
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>₩{Number(item.sellPrice).toLocaleString()}</td>

                                                {/* 13. Fee */}
                                                <td style={{ ...tdStyle, textAlign: 'right', color: '#EF4444' }}>-₩{item.fee.toLocaleString()}</td>

                                                {/* 14. Shipping */}
                                                <td style={{ ...tdStyle, textAlign: 'right', color: '#EF4444' }}>₩{Number(item.shippingFee).toLocaleString()}</td>

                                                {/* 15. Basic Margin */}
                                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500, color: item.basicMargin > 0 ? 'var(--text-main)' : '#EF4444' }}>
                                                    ₩{item.basicMargin.toLocaleString()}
                                                </td>

                                                {/* 16. VAT */}
                                                <td style={{ ...tdStyle, textAlign: 'right', color: '#10B981' }}>+₩{item.vatRefund.toLocaleString()}</td>

                                                {/* 17. Final Margin */}
                                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: item.finalMargin > 0 ? '#10B981' : '#EF4444' }}>
                                                    ₩{item.finalMargin.toLocaleString()}
                                                </td>

                                                {/* 18. ROI Buy */}
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{item.roiPurchase}%</td>

                                                {/* 19. ROI Sell */}
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{item.roiSell}%</td>

                                                {/* 20. Actions */}
                                                <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', marginRight: '0.25rem', background: 'rgba(0,0,0,0.05)' }}
                                                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                                    >수정</button>
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', marginRight: '0.25rem', background: '#3B82F6', color: 'white' }}
                                                        onClick={(e) => { e.stopPropagation(); onCopy && onCopy(item); }}
                                                        title="상품 복사"
                                                    >📋</button>
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', background: '#EF4444', color: 'white' }}
                                                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                    >삭제</button>
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
