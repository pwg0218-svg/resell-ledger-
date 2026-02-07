import React from 'react';
import { InventoryItem } from './InventoryTable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, Percent } from "lucide-react";

interface SalesProjectorProps {
    items: InventoryItem[];
}

export default function SalesProjector({ items }: SalesProjectorProps) {
    // 1. Filter Data
    const soldItems = items.filter(item => item.status === 'Sold');
    const sellingItems = items.filter(item => item.status === 'Selling');

    // 2. Calculate Metrics (Fixed to include Quantity)
    const totalRevenue = soldItems.reduce((acc, item) => acc + ((Number(item.sellPrice) || 0) * (Number(item.quantity) || 1)), 0);
    const totalProfit = soldItems.reduce((acc, item) => acc + ((Number(item.finalMargin) || 0) * (Number(item.quantity) || 1)), 0);
    const totalInventoryValue = sellingItems.reduce((acc, item) => acc + ((Number(item.purchasePrice) || 0) * (Number(item.quantity) || 1)), 0);
    const totalExpenditure = items.reduce((acc, item) => acc + ((Number(item.purchasePrice) || 0) * (Number(item.quantity) || 1)), 0);

    // Calculate Weighted ROI (Total Profit / Total Invested in Sold Items)
    const totalSoldCost = soldItems.reduce((acc, item) => acc + ((Number(item.purchasePrice) || 0) * (Number(item.quantity) || 1)), 0);
    const avgRoi = totalSoldCost > 0
        ? ((totalProfit / totalSoldCost) * 100).toFixed(1)
        : '0';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Total Expenditure (New) */}
            <Card className="bg-white/80 backdrop-blur border-indigo-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">총 매입액 (Total Spent)</CardTitle>
                    <DollarSign className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">₩{totalExpenditure.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">총 {items.length}개 매입</p>
                </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="bg-white/80 backdrop-blur border-indigo-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">총 매출 (Revenue)</CardTitle>
                    <DollarSign className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">₩{totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">판매 완료 {soldItems.length}건</p>
                </CardContent>
            </Card>

            {/* Net Profit */}
            <Card className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg transform hover:scale-[1.02] transition-all border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-indigo-100">순수익 (Net Profit)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₩{totalProfit.toLocaleString()}</div>
                    <p className="text-xs text-indigo-200 font-medium">마진율 {avgRoi}% (ROI)</p>
                </CardContent>
            </Card>

            {/* Inventory Value */}
            <Card className="bg-white/80 backdrop-blur border-indigo-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">재고 자산 (Inventory)</CardTitle>
                    <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">₩{totalInventoryValue.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">보유 중 {sellingItems.length}건</p>
                </CardContent>
            </Card>

            {/* Sell-through Rate / Performance */}
            <Card className="bg-white/80 backdrop-blur border-indigo-100 shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">판매 달성률</CardTitle>
                    <Percent className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                        {items.length > 0 ? Math.round((soldItems.length / items.length) * 100) : 0}%
                    </div>
                    <p className="text-xs text-emerald-600 font-bold">
                        {soldItems.length > 0 ? '판매 흐름 좋음 🚀' : '판매 개시 전'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
