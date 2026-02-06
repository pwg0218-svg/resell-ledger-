import { useState } from 'react';

// API URL (서버 주소와 동일하게 맞춤)
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `http://${window.location.hostname}:3001`;

export default function PurchaseTable({ items, onEdit, onDelete, onStatusToggle }) {
    const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly, all
    const [previewImage, setPreviewImage] = useState(null); // 이미지 미리보기 URL

    const formatPrice = (price) => Number(price).toLocaleString();

    // 이미지 URL 처리
    const getFullImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${API_BASE}${url}`;
    };

    // 뱃지 스타일 헬퍼
    const getProofBadge = (type) => {
        switch (type) {
            case 'tax_invoice': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">세금계산서</span>;
            case 'card': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-200">카드전표</span>;
            case 'cash_receipt': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">현금영수증</span>;
            case 'invoice_free': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">계산서(면세)</span>;
            case 'simple_receipt': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">간이영수증</span>;
            default: return <span className="text-gray-400 text-xs">-</span>;
        }
    };

    const getExpenseTypeLabel = (type) => {
        const types = {
            'merchandise': '상품',
            'shipping': '택배',
            'fee': '수수료',
            'supplies': '비품',
            'other': '기타'
        };
        return types[type] || type || '기타';
    };

    // 주차 계산 헬퍼 (ISO Week)
    const getWeekNumber = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}년 ${weekNo}주차`;
    };

    // 그룹화 로직
    const getGroupedItems = () => {
        const sortedItems = [...items].sort((a, b) => new Date(b.date || b.purchaseDate) - new Date(a.date || a.purchaseDate));

        if (viewMode === 'all') return { '전체 내역': sortedItems };

        return sortedItems.reduce((groups, item) => {
            const dateStr = item.date || item.purchaseDate;
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

    // 전체 요약 계산
    const totalAllSupply = items.reduce((acc, item) => acc + (Number(item.supplyPrice) || 0), 0);
    const totalAllVat = items.reduce((acc, item) => acc + (Number(item.vat) || 0), 0);
    const totalAllSum = items.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* 상단 요약 바 (반응형: 모바일은 세로 스택) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="glass-panel p-3 md:p-4 flex flex-row md:flex-col items-center justify-between md:justify-center bg-blue-50/50 border-blue-100">
                    <span className="text-sm text-blue-600 font-medium">총 공급가액</span>
                    <span className="text-lg md:text-xl font-bold text-gray-800">{formatPrice(totalAllSupply)}원</span>
                </div>
                <div className="glass-panel p-3 md:p-4 flex flex-row md:flex-col items-center justify-between md:justify-center bg-red-50/50 border-red-100">
                    <span className="text-sm text-red-600 font-medium">부가세(환급)</span>
                    <span className="text-lg md:text-xl font-bold text-red-600">{formatPrice(totalAllVat)}원</span>
                </div>
                <div className="glass-panel p-3 md:p-4 flex flex-row md:flex-col items-center justify-between md:justify-center bg-gray-50/50 border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">총 매입 합계</span>
                    <span className="text-lg md:text-xl font-bold text-gray-900">{formatPrice(totalAllSum)}원</span>
                </div>
            </div>

            {/* 보기 모드 탭 (가로 스크롤 가능) */}
            <div className="overflow-x-auto pb-2 md:pb-0">
                <div className="flex bg-gray-100 p-1 rounded-lg w-fit whitespace-nowrap">
                    {['daily', 'weekly', 'monthly', 'all'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1.5 md:px-4 md:py-1.5 rounded-md text-xs md:text-sm font-bold transition-all ${viewMode === mode
                                ? 'bg-white text-primary shadow-sm'
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

            {/* 메인 컨텐츠 영역 */}
            <div className="flex-1 overflow-visible md:overflow-hidden flex flex-col relative h-[calc(100vh-250px)] md:h-[600px]">

                {/* [PC] 테이블 뷰 */}
                <div className="hidden md:block overflow-auto h-full glass-panel !p-0">
                    <table className="w-full">
                        <thead className="bg-gray-100 backdrop-blur sticky top-0 z-10 border-b-2 border-gray-300 shadow-sm">
                            <tr>
                                <th className="p-3 text-left text-sm font-extrabold text-gray-700">날짜</th>
                                <th className="p-3 text-left text-sm font-extrabold text-gray-700">구분</th>
                                <th className="p-3 text-left text-sm font-extrabold text-gray-700">증빙</th>
                                <th className="p-3 text-left text-sm font-extrabold text-gray-700">거래처</th>
                                <th className="p-3 text-left text-sm font-extrabold text-gray-700">품목</th>
                                <th className="p-3 text-right text-sm font-extrabold text-gray-700">공급가액</th>
                                <th className="p-3 text-right text-sm font-extrabold text-gray-700">부가세</th>
                                <th className="p-3 text-right text-sm font-extrabold text-blue-700">합계</th>
                                <th className="p-3 text-center text-sm font-extrabold text-gray-700">상태</th>
                                <th className="p-3 text-center text-sm font-extrabold text-gray-700">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* PC 테이블 로직 (기존과 동일) */}
                            {Object.entries(groupedItems).length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="p-8 text-center text-gray-400">등록된 내역이 없습니다.</td>
                                </tr>
                            ) : (
                                Object.entries(groupedItems).map(([groupKey, groupItems]) => {
                                    // Group Subtotal logic...
                                    const groupSupply = groupItems.reduce((acc, i) => acc + (Number(i.supplyPrice) || 0), 0);
                                    const groupVat = groupItems.reduce((acc, i) => acc + (Number(i.vat) || 0), 0);
                                    const groupSum = groupItems.reduce((acc, i) => acc + (Number(i.totalPrice) || 0), 0);

                                    return (
                                        <div key={groupKey} className="contents">
                                            {viewMode !== 'all' && (
                                                <tr className="bg-gray-50 border-y border-gray-200">
                                                    <td colSpan="10" className="px-4 py-2 font-bold text-gray-700">📅 {groupKey}</td>
                                                </tr>
                                            )}
                                            {groupItems.map(item => (
                                                <tr key={item.id} className="hover:bg-gray-50/80 border-b border-gray-100">
                                                    <td className="p-3 text-sm font-semibold text-gray-800">{item.date || item.purchaseDate}</td>
                                                    <td className="p-3 text-sm font-semibold text-gray-800">{getExpenseTypeLabel(item.expenseType)}</td>
                                                    <td className="p-3">{getProofBadge(item.proofType)}</td>
                                                    <td className="p-3 text-sm font-bold text-gray-900">{item.source}</td>
                                                    <td className="p-3 text-sm">
                                                        <div className="font-bold text-gray-900">{item.name}</div>
                                                        {item.imageUrl && <span className="text-xs text-blue-600 font-medium cursor-pointer" onClick={() => setPreviewImage(getFullImageUrl(item.imageUrl))}>📷 사진보기</span>}
                                                    </td>
                                                    <td className="p-3 text-sm text-right font-bold text-gray-900">{formatPrice(item.supplyPrice)}</td>
                                                    <td className="p-3 text-sm text-right font-bold text-red-600">{formatPrice(item.vat)}</td>
                                                    <td className="p-3 text-sm text-right font-extrabold text-gray-900">{formatPrice(item.totalPrice)}</td>
                                                    <td className="p-3 text-center">
                                                        <span onClick={() => onStatusToggle(item.id, item.status)} className={`px-2 py-1 rounded text-xs cursor-pointer ${item.status === 'Purchased' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {item.status === 'Purchased' ? '구매완료' : '미지급'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <button onClick={() => onEdit(item)} className="text-blue-600 mr-2">✏️</button>
                                                        <button onClick={() => onDelete(item.id)} className="text-red-600">🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Subtotal Row */}
                                            {viewMode !== 'all' && (
                                                <tr className="bg-blue-50/30 border-t border-blue-100 font-bold text-xs">
                                                    <td colSpan="5" className="p-2 text-right">소계</td>
                                                    <td className="p-2 text-right">{formatPrice(groupSupply)}</td>
                                                    <td className="p-2 text-right text-red-500">{formatPrice(groupVat)}</td>
                                                    <td className="p-2 text-right text-blue-800">{formatPrice(groupSum)}</td>
                                                    <td colSpan="2"></td>
                                                </tr>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* [Mobile] 카드 리스트 뷰 */}
                <div className="md:hidden overflow-auto h-full pb-20 space-y-4">
                    {Object.entries(groupedItems).length === 0 ? (
                        <div className="text-center py-10 text-gray-400">내역이 없습니다.</div>
                    ) : (
                        Object.entries(groupedItems).map(([groupKey, groupItems]) => {
                            const groupSum = groupItems.reduce((acc, i) => acc + (Number(i.totalPrice) || 0), 0);

                            return (
                                <div key={groupKey} className="space-y-2">
                                    {viewMode !== 'all' && (
                                        <div className="sticky top-0 z-10 bg-gray-100/95 backdrop-blur py-2 px-1 flex justify-between items-center border-b border-gray-200">
                                            <span className="font-bold text-gray-700 text-sm">📅 {groupKey}</span>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">합계: {formatPrice(groupSum)}원</span>
                                        </div>
                                    )}

                                    {groupItems.map(item => (
                                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs text-gray-500">{item.date?.substring(5)}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.expenseType === 'merchandise' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                                            {getExpenseTypeLabel(item.expenseType)}
                                                        </span>
                                                        {item.imageUrl && <span className="text-[10px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded">📷 사진</span>}
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">{item.source} {item.brand && `· ${item.brand}`}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg text-gray-900">{formatPrice(item.totalPrice)}</div>
                                                    <div className="text-xs text-gray-400">부가세 {formatPrice(item.vat)}</div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-3">
                                                <div className="flex gap-2">
                                                    {getProofBadge(item.proofType)}
                                                    {item.imageUrl && (
                                                        <button onClick={() => setPreviewImage(getFullImageUrl(item.imageUrl))} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-gray-600">
                                                            영수증 보기
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => onStatusToggle(item.id, item.status)} className={`text-xs font-bold px-2 py-1 rounded cursor-pointer ${item.status === 'Purchased' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                                                        {item.status === 'Purchased' ? '완료' : '미지급'}
                                                    </button>
                                                    <div className="h-3 w-px bg-gray-200"></div>
                                                    <button onClick={() => onEdit(item)} className="text-gray-400 hover:text-blue-600">✏️</button>
                                                    <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-600">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer (Mobile & Desktop) */}
                <div className="bg-gray-900 text-white p-4 sticky bottom-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex justify-between items-center md:rounded-b-lg">
                    <span className="text-sm font-medium text-gray-400">총 누적 합계</span>
                    <div className="text-right">
                        <span className="block text-xl font-bold leading-none">{formatPrice(totalAllSum)}원</span>
                        <span className="text-xs text-gray-500">부가세 {formatPrice(totalAllVat)}원 포함</span>
                    </div>
                </div>
            </div>

            {/* 이미지 모달 (반응형) */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                    <div className="relative w-full max-w-lg">
                        <img src={previewImage} alt="Receipt" className="w-full h-auto rounded-lg shadow-2xl" />
                        <button className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2" onClick={() => setPreviewImage(null)}>✕</button>
                    </div>
                </div>
            )}
        </div>
    );
}
