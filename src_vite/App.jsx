import { useState, useEffect } from 'react';
import './index.css';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import ItemForm from './components/ItemForm';
import ExportModal from './components/ExportModal';
import MarginCalculator from './components/MarginCalculator';
import PurchaseTable from './components/PurchaseTable';
import PurchaseForm from './components/PurchaseForm';
import Login from './components/Login';  // Login 컴포넌트 추가
import { calculateMargin } from './utils/calculations';
import { db, auth } from './firebase'; // auth 추가
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Auth 함수 추가

function App() {
  const [user, setUser] = useState(null); // 사용자 상태
  const [authInitialized, setAuthInitialized] = useState(false); // 인증 초기화 상태
  const [items, setItems] = useState([]);

  const [purchases, setPurchases] = useState([]); // 구매대장 데이터
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'purchases'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false); // 구매 폼 모달
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null); // 수정할 구매 아이템
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'SELLING', 'SOLD'
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore에서 데이터 불러오기 (로그인 된 경우만)
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchItems(), fetchPurchases()]);
    setIsLoading(false);
  };

  if (!authInitialized) {
    return <div className="flex justify-center items-center min-h-screen text-white">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const fetchItems = async () => {
    try {
      const docRef = doc(db, "ledgers", "sales");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      } else {
        // 데이터가 없으면 로컬 스토리지 확인 (마이그레이션 용)
        const saved = localStorage.getItem('resell-ledger-items');
        if (saved) {
          const localItems = JSON.parse(saved);
          setItems(localItems);
          // 로컬 데이터를 서버에 최초 업로드
          await setDoc(docRef, { items: localItems });
        }
      }
      setServerError(false);
    } catch (error) {
      console.error('Firestore 연결 실패:', error);
      const saved = localStorage.getItem('resell-ledger-items');
      setItems(saved ? JSON.parse(saved) : []);
      setServerError(true);
    }
  };

  const fetchPurchases = async () => {
    try {
      const docRef = doc(db, "ledgers", "purchases");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.items && Array.isArray(data.items)) {
          setPurchases(data.items);
        } else {
          setPurchases([]);
        }
      } else {
        const saved = localStorage.getItem('resell-ledger-purchases');
        if (saved) {
          const localPurchases = JSON.parse(saved);
          setPurchases(localPurchases);
          await setDoc(docRef, { items: localPurchases });
        }
      }
    } catch (error) {
      console.error('구매 데이터 로드 실패:', error);
      const saved = localStorage.getItem('resell-ledger-purchases');
      setPurchases(saved ? JSON.parse(saved) : []);
    }
  };

  // Firestore에 데이터 저장 (판매대장)
  const syncToServer = async (newItems) => {
    try {
      await setDoc(doc(db, "ledgers", "sales"), { items: newItems });
      setServerError(false);
    } catch (error) {
      console.error('서버 동기화 실패:', error);
      setServerError(true);
    }
    // 백업으로 로컬에도 저장
    localStorage.setItem('resell-ledger-items', JSON.stringify(newItems));
  };

  const handleSaveItem = async (itemData) => {
    let newItems;
    if (editingItem) {
      newItems = items.map(item => item.id === editingItem.id ? { ...itemData, id: item.id } : item);
    } else {
      const newItem = { ...itemData, id: Date.now() };
      newItems = [newItem, ...items];
    }
    setItems(newItems);
    await syncToServer(newItems);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      await syncToServer(newItems);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Selling' ? 'Sold' : 'Selling';
    const newItems = items.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setItems(newItems);
    await syncToServer(newItems);
  };

  // 상품 복사 핸들러
  const handleCopyItem = async (item) => {
    const copiedItem = {
      ...item,
      id: Date.now(),
      status: 'Selling', // 복사된 상품은 기본적으로 '판매중'으로 설정
    };
    const newItems = [copiedItem, ...items];
    setItems(newItems);
    await syncToServer(newItems);
  };

  // 수동 저장 핸들러
  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      await syncToServer(items);
      await syncPurchasesToServer(purchases);
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error('저장 실패:', error);
      setIsSaving(false);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 백업 다운로드 핸들러
  const handleBackup = () => {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      sales: items,
      purchases: purchases
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `관리대장_백업_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 복원 핸들러
  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        if (backupData.sales && backupData.purchases) {
          if (confirm(`${backupData.timestamp} 백업을 복원하시겠습니까?\n\n현재 데이터가 백업 데이터로 대체됩니다.`)) {
            setItems(backupData.sales);
            setPurchases(backupData.purchases);
            await syncToServer(backupData.sales);
            await syncPurchasesToServer(backupData.purchases);
            setLastSaved(new Date());
            alert('백업이 성공적으로 복원되었습니다!');
          }
        } else {
          alert('올바른 백업 파일이 아닙니다.');
        }
      } catch (error) {
        console.error('복원 실패:', error);
        alert('백업 파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // 같은 파일 재선택 가능하도록 초기화
  };

  // --- 구매대장 관련 로직 ---

  // Firestore에 데이터 저장 (구매대장)
  const syncPurchasesToServer = async (newPurchases) => {
    try {
      await setDoc(doc(db, "ledgers", "purchases"), { items: newPurchases });
    } catch (error) {
      console.error('서버 동기화 실패 (구매):', error);
    }
    localStorage.setItem('resell-ledger-purchases', JSON.stringify(newPurchases));
  };

  const handleSavePurchase = async (purchaseData) => {
    let newPurchases;
    if (editingPurchase) {
      newPurchases = purchases.map(p => p.id === editingPurchase.id ? { ...purchaseData, id: p.id } : p);
    } else {
      const newPurchase = { ...purchaseData, id: Date.now() };
      newPurchases = [newPurchase, ...purchases];
    }
    setPurchases(newPurchases);
    await syncPurchasesToServer(newPurchases);
    setIsPurchaseModalOpen(false);
    setEditingPurchase(null);
  };

  const handleDeletePurchase = async (id) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newPurchases = purchases.filter(p => p.id !== id);
      setPurchases(newPurchases);
      await syncPurchasesToServer(newPurchases);
    }
  };

  const handleEditPurchase = (item) => {
    setEditingPurchase(item);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Purchased' : 'Pending';
    const newPurchases = purchases.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setPurchases(newPurchases);
    await syncPurchasesToServer(newPurchases);
  };

  // Calculate stats
  const calculatedItems = items.map(item => ({
    ...item,
    ...calculateMargin(item)
  }));

  const totalItems = items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const totalCost = calculatedItems.reduce((acc, item) => acc + ((item.effectivePurchasePrice || 0) * (Number(item.quantity) || 1)), 0);
  // 잠재 수익은 마진의 합
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
      <header style={{ marginBottom: '2rem', marginTop: '1.5rem' }}>
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              리셀 관리 대장
            </h1>
            <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>재고, 비용, 수익을 한눈에 관리하세요.</p>
          </div>
          <div className="flex items-center" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="flex items-center gap-2 mr-2">
              <span className="text-sm text-gray-400">{user.email}</span>
              <button
                onClick={() => signOut(auth)}
                className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded hover:bg-red-500/30 transition-colors"
                title="로그아웃"
              >
                나가기
              </button>
            </div>
            {activeTab === 'sales' ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  + 상품 추가
                </button>
                <button
                  className="btn glass"
                  onClick={() => setIsExportOpen(true)}
                >
                  📊 엑셀 내보내기
                </button>
                <button
                  className="btn glass"
                  onClick={() => setIsCalculatorOpen(true)}
                >
                  🧮 마진 계산기
                </button>
              </>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => setIsPurchaseModalOpen(true)}
              >
                + 구매 상품 추가
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <div className="flex gap-4 mb-4 border-b border-white/10 overflow-x-auto pb-1" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex gap-4">
          <button
            className={`text-lg font-bold pb-2 px-4 ${activeTab === 'sales' ? 'text-white border-b-2 border-primary' : 'text-muted hover:text-white'}`}
            onClick={() => setActiveTab('sales')}
          >
            📄 판매 대장
          </button>
          <button
            className={`text-lg font-bold pb-2 px-4 ${activeTab === 'purchases' ? 'text-white border-b-2 border-secondary' : 'text-muted hover:text-white'}`}
            onClick={() => setActiveTab('purchases')}
          >
            🛒 구매 대장
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastSaved && (
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              마지막 저장: {lastSaved.toLocaleTimeString('ko-KR')}
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              background: isSaving ? '#10B981' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: isSaving ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isSaving ? '✓ 저장됨!' : '💾 저장하기'}
          </button>
          <button
            onClick={handleBackup}
            style={{
              padding: '8px 12px',
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
            }}
            title="데이터 백업 다운로드"
          >
            📥 백업
          </button>
          <label style={{
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
          }}>
            📤 복원
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <main className="flex flex-col gap-6">
        {activeTab === 'sales' ? (
          <>
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
              onCopy={handleCopyItem}
            />
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-4">
              <h2 className="text-xl font-bold mb-1">구매 예정 및 내역</h2>
              <p className="text-sm text-muted">구매할 상품과 구매 완료된 상품을 관리합니다.</p>
            </div>

            <PurchaseTable
              items={purchases}
              onEdit={handleEditPurchase}
              onDelete={handleDeletePurchase}
              onStatusToggle={handlePurchaseStatusToggle}
            />
          </div>
        )}
      </main>

      <ItemForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSubmit={handleSaveItem}
        initialData={editingItem}
      />

      <PurchaseForm
        isOpen={isPurchaseModalOpen}
        onClose={() => { setIsPurchaseModalOpen(false); setEditingPurchase(null); }}
        onSubmit={handleSavePurchase}
        initialData={editingPurchase}
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
