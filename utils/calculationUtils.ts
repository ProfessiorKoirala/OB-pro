import { Order, Discount, OrderItem } from '../types';

export const calculateOrderTotals = (order: Order, isVatEnabled: boolean, allDiscounts: Discount[] = []) => {
    let itemSubtotal = 0;
    let totalProductDiscount = 0;

    // Filter to items that aren't fully cancelled
    const activeItems = order.items.filter(item => item.status !== 'Cancelled');

    activeItems.forEach(item => {
        // Effective quantity is original minus returned units
        // Exchanged units still count toward current bill unless handled differently
        const effectiveQty = item.quantity - (item.returnedQuantity || 0);
        if (effectiveQty <= 0 && item.status === 'Returned') return;

        const itemEffectiveTotal = item.product.price * effectiveQty;
        itemSubtotal += itemEffectiveTotal;

        // Look for an active discount specific to this product
        const productDiscount = allDiscounts.find(d => d.isActive && d.productId === item.product.id);
        
        if (productDiscount) {
            const discountPerUnit = productDiscount.type === 'PERCENT' 
                ? (item.product.price * productDiscount.value) / 100 
                : productDiscount.value;
            
            totalProductDiscount += discountPerUnit * effectiveQty;
        }
    });

    const subtotalAfterProductDiscounts = Math.max(0, itemSubtotal - totalProductDiscount);

    // 2. Process Global Order-level discount
    const globalDiscountAmount = order.discountType === 'PERCENT' 
        ? (subtotalAfterProductDiscounts * order.discount) / 100 
        : order.discount;

    const totalAfterAllDiscounts = Math.max(0, subtotalAfterProductDiscounts - globalDiscountAmount);

    // 3. Process Tax and Fees
    const taxAmount = isVatEnabled ? totalAfterAllDiscounts * 0.13 : 0;
    const deliveryFee = order.deliveryFee || 0;
    
    const grandTotal = totalAfterAllDiscounts + taxAmount + deliveryFee;
    const amountDue = grandTotal - (order.advanceAmount || 0);
    
    return { 
        subtotal: itemSubtotal, 
        productDiscountAmount: totalProductDiscount,
        globalDiscountAmount,
        discountAmount: totalProductDiscount + globalDiscountAmount,
        taxAmount, 
        deliveryFee, 
        grandTotal, 
        amountDue 
    };
};