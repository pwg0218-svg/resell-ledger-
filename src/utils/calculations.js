export const calculateMargin = (item) => {
    const sellPrice = Number(item.sellPrice) || 0;
    const purchasePrice = Number(item.purchasePrice) || 0;
    // Discount Logic: Only apply if explicitly requested (e.g. by Calculator)
    const discountRate = (item.applyDiscount && item.discountRate) ? Number(item.discountRate) : 1.0;

    const shippingFee = item.shippingFee ? Number(item.shippingFee) : 3000;

    // Fee Logic: 15,000 if <= 150k, else 10%
    const fee = sellPrice <= 150000 ? 15000 : Math.floor(sellPrice * 0.1);

    // VAT Refund Logic: (Purchase Price / 1.1) * 0.1
    // Effective Purchase Price = Purchase Price * Discount Rate (if applicable)
    const effectivePurchasePrice = Math.floor(purchasePrice * discountRate);
    const vatRefund = Math.floor((effectivePurchasePrice / 1.1) * 0.1);

    // Basic Margin (기본마진) = Sell - Buy - Ship - Fee
    // *Spreadsheet "기본마진" implies cash profit before VAT refund
    const basicMargin = sellPrice - effectivePurchasePrice - shippingFee - fee;

    // Final Margin (최종마진) = Basic Margin + VAT Refund
    const finalMargin = basicMargin + vatRefund;

    // ROI Purchase (구매가비 마진율) = (Final Margin / Purchase Price) * 100
    // Using effectivePurchasePrice as the investment basis
    const roiPurchase = effectivePurchasePrice > 0 ? ((finalMargin / effectivePurchasePrice) * 100).toFixed(2) : 0;

    // ROI Sell (판매가비 마진율) = (Final Margin / Sell Price) * 100
    const roiSell = sellPrice > 0 ? ((finalMargin / sellPrice) * 100).toFixed(2) : 0;

    return {
        margin: finalMargin, // "Margin" generally refers to final margin now
        basicMargin,
        finalMargin,
        roiPurchase,
        roiSell,
        fee,
        vatRefund,
        shippingFee,
        effectivePurchasePrice
    };
};
