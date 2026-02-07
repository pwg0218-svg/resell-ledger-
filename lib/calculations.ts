export interface CalculationItem {
    buyPrice?: number | string;
    sellPrice?: number | string;
    shippingFee?: number | string;
    discountRate?: number | string;
    applyDiscount?: boolean;
    saleType?: 'domestic' | 'export';
    manualFee?: number | string; // New: User override
}

export const calculateMargin = (item: CalculationItem) => {
    const sellPrice = Number(item.sellPrice) || 0;
    const purchasePrice = Number(item.buyPrice) || 0;

    // Discount Logic
    const discountRate = (item.applyDiscount && item.discountRate) ? Number(item.discountRate) : 1.0;
    const shippingFee = item.shippingFee ? Number(item.shippingFee) : 0;

    // Fee Logic: Manual Override vs Auto
    let usedFee = 0;
    if (item.manualFee !== undefined && item.manualFee !== '') {
        usedFee = Number(item.manualFee);
    } else {
        // Default Auto Logic (Fallback)
        // 10% standard fee if not manually set
        usedFee = Math.floor(sellPrice * 0.1);
    }

    // Effective Purchase Price
    const effectivePurchasePrice = Math.floor(purchasePrice * discountRate);

    // VAT Logic
    const purchaseVat = Math.floor((effectivePurchasePrice / 1.1) * 0.1);
    const salesVat = item.saleType === 'domestic' ? Math.floor((sellPrice / 1.1) * 0.1) : 0;
    const vatRefund = purchaseVat - salesVat;

    // Basic Margin
    const basicMargin = sellPrice - effectivePurchasePrice - shippingFee - usedFee;

    // Final Margin
    const finalMargin = basicMargin + vatRefund;

    const roiPurchase = effectivePurchasePrice > 0 ? ((finalMargin / effectivePurchasePrice) * 100).toFixed(2) : 0;
    const roiSell = sellPrice > 0 ? ((finalMargin / sellPrice) * 100).toFixed(2) : 0;

    return {
        basicMargin,
        finalMargin,
        roiPurchase,
        roiSell,
        fee: usedFee,
        vatRefund,
        purchaseVat,
        salesVat,
        shippingFee,
        effectivePurchasePrice
    };
};
