import { useState, useEffect } from 'react';
import './index.css';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import ItemForm from './components/ItemForm';
import ExportModal from './components/ExportModal';
import MarginCalculator from './components/MarginCalculator';
import { calculateMargin } from './utils/calculations';

function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('resell-ledger-items');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'SELLING', 'SOLD'

  useEffect(() => {
    localStorage.setItem('resell-ledger-items', JSON.stringify(items));
  }, [items]);

  const handleSaveItem = (itemData) => {
    if (editingItem) {
      // Update existing
      setItems(prev => prev.map(item => item.id === editingItem.id ? { ...itemData, id: item.id } : item));
    } else {
      // Add new
      const newItem = { ...itemData, id: Date.now() };
      setItems(prev => [newItem, ...prev]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleStatusToggle = (id, currentStatus) => {
    const newStatus = currentStatus === 'Selling' ? 'Sold' : 'Selling';
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  // Calculate stats
  // Use calculateMargin utility for consistent logic
  const calculatedItems = items.map(item => ({
    ...item,
    ...calculateMargin(item)
  }));

  const totalItems = items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  // Investment is Effective Purchase Price sum * Quantity
  const totalCost = calculatedItems.reduce((acc, item) => acc + ((item.effectivePurchasePrice || 0) * (Number(item.quantity) || 1)), 0);
  const totalRevenue = items.reduce((acc, item) => acc + (Number(item.sellPrice) * (Number(item.quantity) || 1)), 0);

  // Potential Profit is sum of margins * Quantity
  const potentialProfit = calculatedItems.reduce((acc, item) => acc + (item.margin * (Number(item.quantity) || 1)), 0);

  const roi = totalCost ? ((potentialProfit / totalCost) * 100).toFixed(1) + '%' : '0%';

  const stats = {
    totalItems,
    totalCost: totalCost.toLocaleString(),
    potentialProfit: potentialProfit.toLocaleString(),
    roi
  };

  return (
    <div className="container">
      <header className="flex justify-between items-center" style={{ marginBottom: '2.5rem', marginTop: '2rem' }}>
        <div>
          <h1 style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            리셀 관리 대장
          </h1>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>재고, 비용, 수익을 한눈에 관리하세요.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + 상품 추가
        </button>
        <button
          className="btn"
          style={{ marginLeft: '1rem', background: 'rgba(255,255,255,0.1)' }}
          onClick={() => setIsExportOpen(true)}
        >
          엑셀 내보내기
        </button>
        <button
          className="btn"
          style={{ marginLeft: '1rem', background: 'rgba(255,255,255,0.1)' }}
          onClick={() => setIsCalculatorOpen(true)}
        >
          🧮 마진 계산기
        </button>
      </header>

      <main className="flex flex-col gap-6">
        <Dashboard stats={stats} />

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-1">
          <button
            className={`btn ${filter === 'ALL' ? 'btn-primary' : 'glass'}`}
            onClick={() => setFilter('ALL')}
            style={{ borderRadius: '8px 8px 0 0', borderBottom: filter === 'ALL' ? '2px solid var(--secondary)' : 'none' }}
          >
            전체보기
          </button>
          <button
            className={`btn ${filter === 'SELLING' ? 'btn-primary' : 'glass'}`}
            onClick={() => setFilter('SELLING')}
            style={{ borderRadius: '8px 8px 0 0', borderBottom: filter === 'SELLING' ? '2px solid var(--secondary)' : 'none' }}
          >
            판매중 (Selling)
          </button>
          <button
            className={`btn ${filter === 'SOLD' ? 'btn-primary' : 'glass'}`}
            onClick={() => setFilter('SOLD')}
            style={{ borderRadius: '8px 8px 0 0', borderBottom: filter === 'SOLD' ? '2px solid var(--secondary)' : 'none' }}
          >
            판매완료 (Sold)
          </button>
        </div>

        <InventoryTable
          items={calculatedItems.filter(item => {
            if (filter === 'ALL') return true;
            return filter === 'SOLD' ? item.status === 'Sold' : item.status !== 'Sold';
          })}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onStatusToggle={handleStatusToggle}
        />
      </main>

      <ItemForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSubmit={handleSaveItem}
        initialData={editingItem}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        items={calculatedItems}
      />

      <MarginCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}

export default App;
