import React from 'react';

export default function ExportModal({ isOpen, onClose, items }) {
    if (!isOpen) return null;

    const copyToClipboard = () => {
        // Headers
        // Headers
        // Headers
        const headers = [
            '브랜드', '구매링크', '품번', '모델명', '수량', '사이즈(표준)', '한국사이즈', '사진',
            '판매가', '구매가', '결제수단', '카드사', '예상수수료', '택배비', '기본마진', '부가세환급', '최종마진', '구매가비%', '판매가비%'
        ];

        // Rows (TSV format for Sheets)
        const rows = items.map(item => [
            item.brand,
            item.purchaseLink || '-',
            item.productNumber || '-',
            item.name,
            item.quantity || 1,
            item.size,
            item.sizeKr || '-',
            item.imageUrl ? '있음' : '없음',
            item.sellPrice,
            item.purchasePrice,
            item.paymentMethod || '현금',
            item.cardCompany || '-',
            item.fee,
            item.shippingFee,
            item.basicMargin,
            item.vatRefund,
            item.finalMargin,
            item.roiPurchase + '%',
            item.roiSell + '%'
        ].join('\t'));

        const csvContent = [headers.join('\t'), ...rows].join('\n');

        navigator.clipboard.writeText(csvContent).then(() => {
            alert('클립보드에 복사되었습니다! 구글 스프레드시트에 붙여넣기(Ctrl+V) 하세요.');
            onClose();
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>엑셀/스프레드시트 내보내기</h3>
                <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    데이터를 복사하여 구글 스프레드시트나 엑셀에 바로 붙여넣을 수 있습니다.
                </p>
                <div className="flex flex-col gap-3">
                    <button className="btn btn-primary" onClick={copyToClipboard}>
                        클립보드에 복사하기
                    </button>
                    <button className="btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
