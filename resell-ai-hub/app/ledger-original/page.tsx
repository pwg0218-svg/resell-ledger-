"use client"

import { useState, useEffect } from "react"
import { InventoryTable, InventoryItem } from "@/components/original/InventoryTable"
import { PurchaseTable, PurchaseItem } from "@/components/original/PurchaseTable"
import PurchaseForm from "@/components/original/PurchaseForm"
import ItemForm from "@/components/original/ItemForm"
import SellModal from "@/components/original/SellModal"
import MarginCalculator from "@/components/original/MarginCalculator"
import SalesProjector from "@/components/original/SalesProjector"
import { Button } from "@/components/ui/button"
import { db, auth } from "@/lib/firebase"
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, User } from "firebase/auth"
import { Calculator, Bot, Plus, Camera, Search, RefreshCw } from "lucide-react"

import { Suspense } from 'react'

export default function RestorePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-lg">로딩 중...</div>}>
            <RestorePageContent />
        </Suspense>
    )
}

function RestorePageContent() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');

    // Partial Sell State
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);

    const [salesItems, setSalesItems] = useState<InventoryItem[]>([]);
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

    // UI States
    const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
    const [isItemFormOpen, setIsItemFormOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isResearching, setIsResearching] = useState(false);
    const [isProjectorMode, setIsProjectorMode] = useState(false); // New State

    // Editing States
    const [editingSaleItem, setEditingSaleItem] = useState<InventoryItem | null>(null);
    const [editingPurchaseItem, setEditingPurchaseItem] = useState<PurchaseItem | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user]);

    const refreshData = async () => {
        setIsLoading(true);
        await Promise.all([fetchSales(), fetchPurchases()]);
        setIsLoading(false);
    };

    const fetchSales = async () => {
        try {
            const docRef = doc(db, "ledgers", "sales");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.items && Array.isArray(data.items)) {
                    // Start fresh with fetched data to avoid duplication bugs
                    setSalesItems(data.items);
                }
            }
        } catch (error) {
            console.error("Failed to fetch sales:", error);
        }
    }

    const fetchPurchases = async () => {
        try {
            const docRef = doc(db, "ledgers", "purchases");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.items && Array.isArray(data.items)) {
                    setPurchaseItems(data.items);
                }
            }
        } catch (error) {
            console.error("Failed to fetch purchases:", error);
        }
    }

    useEffect(() => {
        // Handle Redirect Result (Mobile Login)
        getRedirectResult(auth).catch((error) => {
            console.error("Redirect login failed", error);
        });
    }, []);

    const handleLogin = async () => {
        try {
            // Use Redirect for better mobile support (avoids 403 disallowed_useragent)
            await signInWithRedirect(auth, new GoogleAuthProvider());
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    // --- SALES ACTIONS ---

    const handleAddSale = async (data: Omit<InventoryItem, 'id'>) => {
        if (!user) return;

        let newItem: InventoryItem;
        let updatedItems: InventoryItem[];

        if (editingSaleItem && editingSaleItem.id !== 'COPY_MODE') {
            // Update existing
            newItem = { ...data, id: editingSaleItem.id, date: editingSaleItem.date } as InventoryItem; // Keep ID and Date
            updatedItems = salesItems.map(item => item.id === editingSaleItem.id ? newItem : item);
        } else {
            // Create new (or Copy)
            newItem = {
                ...data,
                id: Date.now(),
                date: new Date().toISOString().split('T')[0]
            } as InventoryItem;
            updatedItems = [newItem, ...salesItems];
        }

        // Sanitize: Replace undefined with null or valid defaults before saving
        updatedItems = updatedItems.map(item => {
            const sanitized = { ...item };
            Object.keys(sanitized).forEach(key => {
                if (sanitized[key] === undefined) {
                    sanitized[key] = null; // or generic default
                }
            });
            // Specific safeguards
            if (!sanitized.channels) sanitized.channels = [];
            if (sanitized.fee === undefined || sanitized.fee === null) sanitized.fee = ''; // or 0

            // Ensure status and saleType are valid strings or default
            if (!sanitized.status) sanitized.status = 'Selling';
            if (!sanitized.saleType) sanitized.saleType = 'export';
            if (!sanitized.date) sanitized.date = new Date().toISOString().split('T')[0];

            return sanitized as InventoryItem;
        });

        // Optimistic Update
        setSalesItems(updatedItems);

        try {
            const docRef = doc(db, "ledgers", "sales");
            await setDoc(docRef, { items: updatedItems }, { merge: true });
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다.");
            refreshData(); // Revert on error
        }

        setEditingSaleItem(null); // Close edit mode
    };

    const handleEditSale = (item: InventoryItem) => {
        setEditingSaleItem(item);
        setIsItemFormOpen(true);
    };

    const handleDeleteSale = async (id: string | number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        const updatedItems = salesItems.filter(item => item.id !== id);
        setSalesItems(updatedItems);

        try {
            const docRef = doc(db, "ledgers", "sales");
            await setDoc(docRef, { items: updatedItems }, { merge: true });
        } catch (e) {
            console.error(e);
            refreshData();
        }
    };

    const handleStatusToggleSale = async (item: InventoryItem) => {
        if (item.status === 'Sold') {
            // "Undo" Sale - Mark back to Selling
            const updatedItems = salesItems.map(i =>
                i.id === item.id ? { ...i, status: 'Selling' as const } : i
            );
            setSalesItems(updatedItems);
            try {
                const docRef = doc(db, "ledgers", "sales");
                await setDoc(docRef, { items: updatedItems }, { merge: true });
            } catch (e) {
                console.error(e);
                refreshData();
            }
        } else {
            // Open Sell Dialog
            setSellingItem(item);
            setIsSellModalOpen(true);
        }
    };

    const handleSellConfirm = async (soldQty: number) => {
        if (!sellingItem) return;

        let updatedItems = [...salesItems];
        const currentQty = sellingItem.quantity;
        const actualSoldQty = Math.min(soldQty, currentQty);

        if (actualSoldQty === currentQty) {
            // SOLD ALL
            updatedItems = updatedItems.map(i =>
                i.id === sellingItem.id ? { ...i, status: 'Sold' as const } : i
            );
        } else {
            // PARTIAL SELL - Split
            const remainingQty = currentQty - actualSoldQty;

            // 1. Update Remaining (Original)
            updatedItems = updatedItems.map(i =>
                i.id === sellingItem.id ? { ...i, quantity: remainingQty } : i
            );

            // 2. Create Sold (New)
            const newItem: InventoryItem = {
                ...sellingItem,
                id: Date.now(),
                quantity: actualSoldQty,
                status: 'Sold',
                date: new Date().toISOString().split('T')[0]
            };
            updatedItems = [newItem, ...updatedItems];
        }

        setSalesItems(updatedItems);
        setIsSellModalOpen(false);
        setSellingItem(null);

        try {
            const docRef = doc(db, "ledgers", "sales");
            await setDoc(docRef, { items: updatedItems }, { merge: true });
        } catch (e) {
            console.error(e);
            refreshData();
        }
    };

    // --- PURCHASE ACTIONS ---

    const handleAddPurchase = async (data: Omit<PurchaseItem, 'id'>) => {
        if (!user) return;

        let newItem: PurchaseItem;
        let updatedItems: PurchaseItem[];

        if (editingPurchaseItem) {
            newItem = { ...data, id: editingPurchaseItem.id };
            updatedItems = purchaseItems.map(item => item.id === editingPurchaseItem.id ? newItem : item);
        } else {
            newItem = { ...data, id: Date.now().toString() } as PurchaseItem;
            updatedItems = [newItem, ...purchaseItems];
        }

        setPurchaseItems(updatedItems);

        try {
            const docRef = doc(db, "ledgers", "purchases");
            await setDoc(docRef, { items: updatedItems }, { merge: true });
        } catch (e) {
            console.error(e);
            refreshData();
        }

        setEditingPurchaseItem(null);
    };

    const handleEditPurchase = (item: PurchaseItem) => {
        setEditingPurchaseItem(item);
        setIsPurchaseFormOpen(true);
    };

    const handleDeletePurchase = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        const updatedItems = purchaseItems.filter(item => item.id !== id);
        setPurchaseItems(updatedItems);

        try {
            const docRef = doc(db, "ledgers", "purchases");
            await setDoc(docRef, { items: updatedItems }, { merge: true });
        } catch (e) {
            console.error(e);
            refreshData();
        }
    };

    const handleStatusTogglePurchase = async (id: string, currentStatus: string) => {
        // Typically Purchase Status might be 'Ordered' -> 'Arrived' -> 'Purchased'
        // For now, toggle Paid/NotPaid or similar if implemented
        // Or just nothing if not needed. User code had 'Purchased' | 'NotPaid'
        const newStatus = currentStatus === 'Purchased' ? 'NotPaid' : 'Purchased';
        const updatedItems = purchaseItems.map(item =>
            item.id === id ? { ...item, status: newStatus as any } : item
        );
        setPurchaseItems(updatedItems);

        try {
            const docRef = doc(db, "ledgers", "purchases");
            await setDoc(docRef, { items: updatedItems }, { merge: true });
        } catch (e) {
            console.error(e);
            refreshData();
        }
    };


    // AI Researcher Trigger
    const handleRunResearch = async () => {
        setIsResearching(true);
        try {
            const res = await fetch('/api/research', { method: 'POST' });
            const data = await res.json();
            alert(`🔍 연구원들이 ${data.message || '작업을 시작했습니다'}. 텔레그램을 확인하세요!`);
        } catch (error) {
            alert("연구원 호출 실패");
        } finally {
            setIsResearching(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">Resell AI Hub</h1>
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-gray-800">로그인이 필요합니다</h2>
                        <p className="mb-6 text-gray-500 text-sm">
                            안전한 데이터 관리를 위해<br />Google 계정으로 로그인해주세요.
                        </p>
                        <Button onClick={handleLogin} className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-bold py-6 rounded-xl transition-all hover:shadow-md">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" />
                            Google 계정으로 계속하기
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-2 md:p-4 bg-[#F3F4F6]">
            {/* Header / Command Center */}
            <header className="mb-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 sticky top-2 z-30 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg shrink-0">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-none">Resell AI Hub</h1>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{user.displayName}님의 연구실</p>
                    </div>
                    <div className="ml-auto md:hidden">
                        <Button variant="ghost" size="icon" onClick={refreshData} disabled={isLoading}>
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2 items-center w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <Button
                        onClick={() => setIsProjectorMode(!isProjectorMode)}
                        className={`gap-2 font-bold border shrink-0 transition-all h-10 px-4 rounded-md ${isProjectorMode ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        📊 <span className="hidden md:inline">대시보드</span>
                    </Button>

                    <Button
                        onClick={() => setIsCalculatorOpen(true)}
                        className="gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold border border-indigo-100 shrink-0 h-10 px-4 rounded-md"
                    >
                        <Calculator size={16} />
                        <span className="hidden md:inline">마진 </span>계산기
                    </Button>

                    <Button
                        onClick={handleRunResearch}
                        disabled={isResearching}
                        className={`gap-2 font-bold text-white transition-all shrink-0 h-10 px-4 rounded-md ${isResearching ? 'bg-gray-400' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30'}`}
                    >
                        {isResearching ? (
                            <><span className="animate-spin">⌛</span> 연구 중...</>
                        ) : (
                            <><Search size={16} /> AI 연구원<span className="hidden md:inline"> 호출</span></>
                        )}
                    </Button>

                    <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

                    <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'sales' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            판매 장부
                        </button>
                        <button
                            onClick={() => setActiveTab('purchases')}
                            className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'purchases' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            매입 대장
                        </button>
                    </div>
                </div>
            </header>

            <main className="pb-20">
                {isProjectorMode && (
                    <SalesProjector items={salesItems} />
                )}

                <SellModal
                    isOpen={isSellModalOpen}
                    onClose={() => setIsSellModalOpen(false)}
                    onConfirm={handleSellConfirm}
                    item={sellingItem}
                />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p>데이터를 불러오고 있습니다...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'sales' ? (
                            <InventoryTable
                                items={salesItems}
                                onEdit={handleEditSale}
                                onDelete={handleDeleteSale}
                                onStatusToggle={handleStatusToggleSale}
                                onCopy={(item) => {
                                    // Open ItemForm with item data but NO ID (so it treats as new)
                                    // we pass it as 'editingSaleItem' but with a special flag or just ID null?
                                    // Actually, ItemForm uses initialData. If we pass initialData with ID, it thinks it's editing.
                                    // Solution: Pass a copy with a distinct indicator or handle in handleAddSale.
                                    // Better: Just set it as editingSaleItem but modify the ID to 0 or null before setting state?
                                    // No, TS might complain. 
                                    // Let's create a specific state for "Copying" or just hack it:
                                    // Pass it as 'initialData' but make sure handleAddSale knows to create NEW.
                                    // Wait, handleAddSale checks 'editingSaleItem'. If that is set, it updates.
                                    // So we CANNOT set editingSaleItem.
                                    // We should reuse the form opening logic but strip the ID.
                                    // 3. Set this as editingSaleItem.
                                    // 4. BUT handleAddSale will try to update undefined ID?
                                    // 5. Let's just set editingSaleItem to null, and pass the data via a NEW state? 
                                    //    Too complex.

                                    // CORRECT STRATEGY:
                                    // Use editingSaleItem, but set id to a special value like -1?
                                    // No, let's just use the form's ability. 
                                    // If I setEditingSaleItem({ ...item, id: '' }), handleAddSale logic:
                                    // if (editingSaleItem) -> Update. 
                                    // We need to bypass that.

                                    // Workaround: 
                                    // Workaround:
                                    // We will set editingSaleItem to null (so handleAddSale creates new).
                                    // We need to pass the "copied data" to ItemForm another way?
                                    // Or... allow ItemForm to accept 'defaultValues' separate from 'initialData'?

                                    // Let's stick to the existing pattern but be smart.
                                    // We will set editingSaleItem to { ...item, id: 'COPY_MODE' }
                                    // And in handleAddSale, if id is 'COPY_MODE', treat as new.

                                    const copyItem = { ...item, id: 'COPY_MODE' };
                                    setEditingSaleItem(copyItem as any);
                                    setIsItemFormOpen(true);
                                }}
                            />
                        ) : (
                            <PurchaseTable
                                items={purchaseItems}
                                onEdit={handleEditPurchase}
                                onDelete={handleDeletePurchase}
                                onStatusToggle={handleStatusTogglePurchase}
                            />
                        )}
                    </>
                )}
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <Button
                    onClick={() => {
                        if (activeTab === 'sales') {
                            setEditingSaleItem(null); // Clear edit mode
                            setIsItemFormOpen(true);
                        } else {
                            setEditingPurchaseItem(null); // Clear edit mode
                            setIsPurchaseFormOpen(true);
                        }
                    }}
                    className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-300 flex items-center justify-center transition-all hover:scale-105 hover:rotate-90 active:scale-95"
                >
                    <Plus size={28} />
                </Button>
            </div>

            {/* Modals */}
            <PurchaseForm
                isOpen={isPurchaseFormOpen}
                onClose={() => {
                    setIsPurchaseFormOpen(false);
                    setEditingPurchaseItem(null);
                }}
                onSubmit={handleAddPurchase}
                initialData={editingPurchaseItem}
            />
            <ItemForm
                isOpen={isItemFormOpen}
                onClose={() => {
                    setIsItemFormOpen(false);
                    setEditingSaleItem(null);
                }}
                onSubmit={handleAddSale}
                initialData={editingSaleItem}
            />
            <MarginCalculator
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
            />
        </div>
    )
}
