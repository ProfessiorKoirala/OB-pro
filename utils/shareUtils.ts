import { Order, Creditor, BusinessProfile, Payment, Purchase, VendorPayment, UnifiedContact, AppDataBackup } from '../types';
import { calculateOrderTotals } from './calculationUtils';

type CreditHistoryItem = (Order & { historyType: 'credit' }) | (Payment & { historyType: 'payment' });
type VendorHistoryItem = (Purchase & { historyType: 'purchase' }) | (VendorPayment & { historyType: 'payment' });


const formatCurrency = (value: number) => `₹${(value || 0).toFixed(2)}`;

export const shareBillAsText = (order: Order, businessProfile: BusinessProfile): string => {
    let text = `*Tax Invoice*\n`;
    text += `-----------------------------------\n`;
    text += `*${businessProfile.businessName}*\n`;
    text += `*Order ID:* #${order.id.slice(-6).toUpperCase()}\n`;
    text += `*Date:* ${new Date(order.timestamp).toLocaleString()}\n`;
    text += `*Customer:* ${order.customerName || 'Walk-in'}\n`;
    text += `-----------------------------------\n\n`;
    text += `*ITEMS*\n`;

    order.items.forEach(item => {
        text += `${item.quantity} x ${item.product.name} - ${formatCurrency(item.product.price * item.quantity)}\n`;
    });

    // Use the centralized calculation utility
    const { subtotal, discountAmount, taxAmount, deliveryFee, grandTotal, amountDue } = calculateOrderTotals(order, true); // Assuming VAT for sharing

    text += `\n-----------------------------------\n`;
    text += `*Subtotal:* ${formatCurrency(subtotal)}\n`;
    text += `*Discount:* -${formatCurrency(discountAmount)}\n`;
    if (deliveryFee > 0) {
        text += `*Delivery Fee:* ${formatCurrency(deliveryFee)}\n`;
    }
    text += `*VAT (13%):* ${formatCurrency(taxAmount)}\n`;
    text += `*Grand Total:* *${formatCurrency(grandTotal)}*\n`;
    if ((order.advanceAmount || 0) > 0) {
        text += `*Advance Paid:* -${formatCurrency(order.advanceAmount!)}\n`;
        text += `*Amount Due:* *${formatCurrency(amountDue)}*\n`;
    }
    text += `-----------------------------------\n\n`;
    text += `Thank you for your visit!`;

    return text;
};

export const shareCreditorStatementAsText = (
    creditor: Creditor,
    creditHistory: CreditHistoryItem[],
    balance: number,
    advance: number,
    businessProfile: BusinessProfile
): string => {
    let text = `*Creditor Statement for ${creditor.name}*\n`;
    text += `-----------------------------------\n`;
    text += `*Date:* ${new Date().toLocaleDateString()}\n`;
    text += `*Business:* ${businessProfile.businessName}\n`;
    text += `-----------------------------------\n\n`;
    text += `*TRANSACTION HISTORY*\n`;

    creditHistory.forEach(item => {
        if (item.historyType === 'credit') {
            text += `${new Date(item.timestamp).toLocaleDateString('en-GB')} - Credit Sale: -${formatCurrency(item.grandTotal || 0)}\n`;
        } else {
            const type = item.type === 'Credit Payment' ? 'Payment' : 'Adv. Return';
            const sign = item.type === 'Credit Payment' ? '+' : '-';
            text += `${new Date(item.date).toLocaleDateString('en-GB')} - ${type}: ${sign}${formatCurrency(item.amount)}\n`;
        }
    });

    text += `\n-----------------------------------\n`;
    text += `*SUMMARY*\n`;
    if (balance > 0) {
        text += `*Total Amount Due:* *${formatCurrency(balance)}*\n`;
    }
    if (advance > 0) {
        text += `*Advance Paid:* *${formatCurrency(advance)}*\n`;
    }
    if (balance <= 0 && advance <= 0) {
        text += `*Balance Settled: ${formatCurrency(0)}*\n`;
    }
    text += `-----------------------------------\n\n`;
    text += `Thank you!`;

    return text;
};

interface PayslipShareData {
    staffName: string;
    month: string;
    baseSalary: number;
    bonus: number;
    deductions: number;
    taxDeduction: number;
    netPaid: number;
    presentDays: number;
    absentDays: number;
    leaveDays: number;
    halfDays: number;
    sickDays: number;
    businessName: string;
}

export const sharePayslipAsText = (data: PayslipShareData): string => {
    let text = `*Payslip for ${data.month}*\n`;
    text += `*${data.businessName}*\n\n`;
    text += `Hi ${data.staffName},\n\n`;
    text += `Here is your salary summary for the month:\n`;
    text += `-----------------------------------\n`;
    text += `*Earnings*\n`;
    text += `  - Base Salary: ${formatCurrency(data.baseSalary)}\n`;
    if (data.bonus > 0) text += `  - Bonus: ${formatCurrency(data.bonus)}\n`;
    text += `*Deductions*\n`;
    text += `  - Unpaid Leave: -${formatCurrency(data.deductions)}\n`;
    if (data.taxDeduction > 0) text += `  - Tax (TDS): -${formatCurrency(data.taxDeduction)}\n`;
    text += `-----------------------------------\n`;
    text += `*Net Salary Paid: ${formatCurrency(data.netPaid)}*\n`;
    text += `-----------------------------------\n\n`;
    text += `*Attendance Summary:*\n`;
    text += `- Present: ${data.presentDays} days\n`;
    text += `- Absent/Unpaid Leave: ${data.absentDays + data.leaveDays} days\n`;
    text += `- Half Days: ${data.halfDays}\n`;
    text += `- Sick Leave (Paid): ${data.sickDays} days\n\n`;
    text += `Thank you for your hard work!`;
    return text;
};


export const shareVendorStatementAsText = (
    vendor: UnifiedContact,
    purchases: Purchase[],
    payments: VendorPayment[],
    businessProfile: BusinessProfile
): string => {
    const vendorPurchases = purchases.filter(p => p.vendorId === vendor.originalId);
    const vendorPayments = payments.filter(p => p.vendorId === vendor.originalId);
    const totalPurchased = vendorPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaidForPurchases = vendorPurchases.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalSeparatePayments = vendorPayments.filter(p => p.type === 'Vendor Payment').reduce((sum, p) => sum + p.amount, 0);
    const totalAdvancePaid = vendorPayments.filter(p => p.type === 'Advance Payment').reduce((sum, p) => sum + p.amount, 0);
    const effectiveBalance = totalPurchased - totalPaidForPurchases - totalSeparatePayments - totalAdvancePaid;
    const balance = effectiveBalance > 0 ? effectiveBalance : 0;
    const advance = effectiveBalance < 0 ? -effectiveBalance : 0;
    
    let text = `*Vendor Statement for ${vendor.name}*\n`;
    text += `-----------------------------------\n`;
    if (balance > 0) text += `*Amount Due to Vendor:* *${formatCurrency(balance)}*\n`;
    if (advance > 0) text += `*Our Advance Payment:* *${formatCurrency(advance)}*\n`;
    text += `-----------------------------------\n\nThank you!`;
    return text;
}

export const shareCustomerStatementAsText = (
    customer: UnifiedContact,
    orders: Order[],
    businessProfile: BusinessProfile
): string => {
    const customerOrders = orders.filter(o => o.customerId === customer.originalId || (o.customerName === customer.name && o.customerPhone === customer.phone));
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    
    let text = `*Summary for ${customer.name}*\n`;
    text += `-----------------------------------\n`;
    text += `*Total Orders:* ${customerOrders.length}\n`;
    text += `*Total Spent:* ${formatCurrency(totalSpent)}\n`;
    text += `-----------------------------------\n\n`;
    text += `Thank you for your business, from *${businessProfile.businessName}*!`;
    return text;
}

export const generateStatementText = (contact: UnifiedContact, appData: AppDataBackup, businessProfile: BusinessProfile): string => {
    switch (contact.type) {
        case 'Customer':
            return shareCustomerStatementAsText(contact, appData.orders, businessProfile);
        case 'Creditor':
             const creditor = appData.creditors.find(c => c.id === contact.originalId);
             if (!creditor) return "Creditor not found.";
             
             const creditorOrders = appData.orders.filter(o => o.creditorId === creditor.id && o.paymentMethod === 'Credit');
             const creditorPayments = appData.payments.filter(p => p.creditorId === creditor.id);
             const creditHistory: CreditHistoryItem[] = [
                ...creditorOrders.map(o => ({ ...o, historyType: 'credit' as const })),
                ...creditorPayments.map(p => ({ ...p, historyType: 'payment' as const }))
             ].sort((a,b) => (b.historyType === 'credit' ? b.timestamp : b.date) - (a.historyType === 'credit' ? a.timestamp : a.date));

             const totalCredit = creditorOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
             const totalPaid = creditorPayments.filter(p => p.type === 'Credit Payment').reduce((sum, p) => sum + p.amount, 0);
             const totalReturned = creditorPayments.filter(p => p.type === 'Advance Return').reduce((sum, p) => sum + p.amount, 0);
             const effectiveBalance = totalCredit - totalPaid + totalReturned;

            return shareCreditorStatementAsText(creditor, creditHistory, Math.max(0, effectiveBalance), Math.max(0, -effectiveBalance), businessProfile);
        case 'Vendor':
            return shareVendorStatementAsText(contact, appData.purchases, appData.vendorPayments, businessProfile);
        default:
            return "No statement available for this contact type.";
    }
};


export const shareOnWhatsApp = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
};
