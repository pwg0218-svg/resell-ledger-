import React from 'react';
import { calculateMargin } from '../utils/calculations';

export default function InventoryTable({ items, onEdit, onDelete, onStatusToggle }) {
    return (
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>재고 목록</h2>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>총 {items.length}개</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>상태</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>수량</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>사진</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>브랜드</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>모델명</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>사이즈(표준)</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>한국사이즈</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>품번</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>구매링크</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>구매가</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>결제정보</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>판매가</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>예상수수료</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>택배비</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>기본마진</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>부가세환급</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>최종마진</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>구매가비%</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>판매가비%</th>
                            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>관리</th>
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
                            items.map(item => (
                                <tr
                                    key={item.id}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'center' }}
                                    onClick={() => onEdit(item)}
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

                                    {/* 2. Quantity */}
                                    <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
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
                                    <td style={{ padding: '0.75rem' }}>₩{Number(item.purchasePrice).toLocaleString()}</td>

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
                                    <td style={{ padding: '0.75rem' }}>₩{Number(item.sellPrice).toLocaleString()}</td>

                                    {/* 13. Fee */}
                                    <td style={{ padding: '0.75rem', color: '#EF4444' }}>-₩{item.fee.toLocaleString()}</td>

                                    {/* 14. Shipping */}
                                    <td style={{ padding: '0.75rem', color: '#EF4444' }}>-₩{Number(item.shippingFee).toLocaleString()}</td>

                                    {/* 15. Basic Margin */}
                                    <td style={{ padding: '0.75rem', fontWeight: 500, color: item.basicMargin > 0 ? 'var(--text-main)' : '#EF4444' }}>
                                        ₩{item.basicMargin.toLocaleString()}
                                    </td>

                                    {/* 16. VAT */}
                                    <td style={{ padding: '0.75rem', color: '#10B981' }}>+₩{item.vatRefund.toLocaleString()}</td>

                                    {/* 17. Final Margin */}
                                    <td style={{ padding: '0.75rem', fontWeight: 700, color: item.finalMargin > 0 ? '#10B981' : '#EF4444' }}>
                                        ₩{item.finalMargin.toLocaleString()}
                                    </td>

                                    {/* 18. ROI Buy */}
                                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{item.roiPurchase}%</td>

                                    {/* 19. ROI Sell */}
                                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{item.roiSell}%</td>

                                    {/* 20. Actions */}
                                    <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="btn"
                                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', marginRight: '0.25rem', background: 'rgba(0,0,0,0.05)' }}
                                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                        >수정</button>
                                        <button
                                            className="btn"
                                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', background: '#EF4444', color: 'white' }}
                                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                        >삭제</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
