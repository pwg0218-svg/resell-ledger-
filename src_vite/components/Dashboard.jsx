import React from 'react';

const StatCard = ({ title, value, subtext }) => {
    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{title}</span>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
            {subtext && <div className="text-muted" style={{ fontSize: '0.85rem' }}>{subtext}</div>}
        </div>
    );
};

export default function Dashboard({ stats }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <StatCard
                title="총 상품 수"
                value={stats.totalItems}
                subtext="현재 보유 재고"
            />
            <StatCard
                title="총 투자 금액"
                value={`₩${stats.totalCost}`}
                subtext="매입 원가 합계"
            />
            <StatCard
                title="예상 순수익"
                value={`₩${stats.potentialProfit}`}
                subtext="판매 완료 시 예상마진"
            />
            <StatCard
                title="평균 수익률 (ROI)"
                value={stats.roi}
                subtext="투자 대비 수익률"
            />
        </div>
    );
}
