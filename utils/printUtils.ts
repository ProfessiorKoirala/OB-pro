import React from 'react';
import { createRoot } from 'react-dom/client';
import { Order, Creditor, Payment, BusinessProfile, Vendor, Purchase, VendorPayment, Staff, Attendance, Payroll, Holiday, BusinessSettings, Expense, Customer, Product, KOT, CashClosing } from '../types';
import PrintableBill from '../components/PrintableBill';
import PrintableCreditorStatement from '../components/PrintableCreditorStatement';
import PrintableReport from '../components/PrintableReport';
import PrintablePurchaseBill from '../components/PrintablePurchaseBill';
import PrintableVendorStatement from '../components/PrintableVendorStatement';
import PrintableStaffStatement from '../components/PrintableStaffStatement';
import PrintableList, { Column } from '../components/PrintableList';
import PrintableCustomerStatement from '../components/PrintableCustomerStatement';
import PrintableExpenseReceipt from '../components/PrintableExpenseReceipt';
import PrintableMenu from '../components/PrintableMenu';
import PrintableJoiningLetter from '../components/PrintableJoiningLetter';
import PrintableDailyReport from '../components/PrintableDailyReport';
import PrintableKOT from '../components/PrintableKOT';
import PrintableTodayDeliveryManifest from '../components/tracker/PrintableTodayDeliveryManifest';
import PrintableClosingReport from '../components/PrintableClosingReport';

const renderAndPrint = (content: React.ReactElement, onPrintFinished?: () => void) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '800px';
    iframe.style.height = '600px';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.title = 'OB Pro Print Job';

    document.body.appendChild(iframe);

    const printDocument = iframe.contentDocument;
    if (!printDocument || !iframe.contentWindow) {
        console.error("Print Engine Error: Access denied to iframe context.");
        document.body.removeChild(iframe);
        onPrintFinished?.();
        return;
    }

    printDocument.open();
    printDocument.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Print</title>
            </head>
            <body>
                <div id="print-root"></div>
            </body>
        </html>
    `);
    printDocument.close();

    const head = printDocument.head;
    document.head.querySelectorAll('link, style').forEach(el => {
        head.appendChild(el.cloneNode(true));
    });

    const printContainer = printDocument.getElementById('print-root');
    if (!printContainer) {
        document.body.removeChild(iframe);
        onPrintFinished?.();
        return;
    }
    
    const root = createRoot(printContainer);
    root.render(content);

    let attempts = 0;
    const maxAttempts = 50;

    const checkReadyAndPrint = async () => {
        attempts++;
        const images = printDocument.getElementsByTagName('img');
        const allLoaded = Array.from(images).every(img => img.complete);
        
        let fontsReady = true;
        try {
            if ((printDocument as any).fonts) {
                fontsReady = await (printDocument as any).fonts.ready;
            }
        } catch (e) {
            console.warn('Font loading check failed', e);
        }

        if ((allLoaded && fontsReady) || attempts >= maxAttempts) {
            setTimeout(() => {
                try {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                        
                        setTimeout(() => {
                            root.unmount();
                            if (iframe.parentElement) {
                                iframe.parentElement.removeChild(iframe);
                            }
                            onPrintFinished?.();
                        }, 2000);
                    }
                } catch (e) {
                    console.error('Print trigger failed:', e);
                    if (iframe.parentElement) document.body.removeChild(iframe);
                    onPrintFinished?.();
                }
            }, 500);
        } else {
            requestAnimationFrame(checkReadyAndPrint);
        }
    };

    requestAnimationFrame(checkReadyAndPrint);
};

export const printOrder = (order: Order, businessProfile: BusinessProfile, isVatEnabled: boolean, onPrintFinished?: () => void) => {
    renderAndPrint(React.createElement(PrintableBill, { order, businessProfile, isVatEnabled }), onPrintFinished);
};

export const printOrders = (orders: Order[], businessProfile: BusinessProfile, isVatEnabled: boolean) => {
    const billsToPrint = React.createElement(
        'div',
        null,
        orders.map((order, index) => 
            React.createElement(
                'div', 
                { key: order.id, style: { pageBreakAfter: 'always' } },
                React.createElement(PrintableBill, { order, businessProfile, isVatEnabled })
            )
        )
    );
    renderAndPrint(billsToPrint);
};

export const printCreditorStatement = (
    creditor: Creditor,
    creditHistory: any[],
    balance: number,
    advance: number,
    businessProfile: BusinessProfile
) => {
    renderAndPrint(React.createElement(PrintableCreditorStatement, { creditor, creditHistory, balance, advance, businessProfile }));
};

export const printVendorStatement = (
    vendor: Vendor,
    transactionHistory: any[],
    balance: number,
    advance: number,
    businessProfile: BusinessProfile
) => {
    renderAndPrint(React.createElement(PrintableVendorStatement, { vendor, transactionHistory, balance, advance, businessProfile }));
};

export const printPurchaseBill = (purchase: Purchase, vendor: Vendor, businessProfile: BusinessProfile) => {
    renderAndPrint(React.createElement(PrintablePurchaseBill, { purchase, vendor, businessProfile }));
};

export const printStaffStatement = (
    staff: Staff,
    month: Date,
    attendance: Attendance[],
    payroll: Payroll | undefined,
    businessProfile: BusinessProfile,
    holidays: Holiday[],
    settings: BusinessSettings
) => {
    renderAndPrint(React.createElement(PrintableStaffStatement, { staff, month, attendance, payroll, businessProfile, holidays, settings }));
};

export const printReport = (title: string, businessProfile: BusinessProfile, content: React.ReactElement) => {
    renderAndPrint(React.createElement(PrintableReport, { title, businessProfile, children: content }));
};

export const printList = <T,>(title: string, columns: Column<T>[], data: T[], businessProfile: BusinessProfile) => {
    const listContent = React.createElement(PrintableList as any, { columns, data });
    printReport(title, businessProfile, listContent);
};

export const printExpenseReport = (expenses: Expense[], period: string, businessProfile: BusinessProfile) => {
    const expenseColumns: Column<Expense>[] = [
        { header: 'Date', accessor: (item) => new Date(item.date).toLocaleDateString('en-GB') },
        { header: 'Title', accessor: 'title' },
        { header: 'Category', accessor: 'category' },
        { header: 'Amount', accessor: (item) => `₹${item.amount.toLocaleString('en-IN')}`, align: 'right' }
    ];
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const footer = React.createElement('div', {style: {textAlign: 'right', fontWeight: 'bold', marginTop: '20px', fontSize: '1.2em'}}, `Total Expenses: ₹${total.toLocaleString('en-IN')}`);
    const listContent = React.createElement('div', null, React.createElement(PrintableList as any, { columns: expenseColumns, data: expenses }), footer);
    printReport(`Expense Report (${period})`, businessProfile, listContent);
}

export const printExpense = (expense: Expense, businessProfile: BusinessProfile) => {
    renderAndPrint(React.createElement(PrintableExpenseReceipt, { expense, businessProfile }));
};

export const printCustomerStatement = (
    customer: Customer,
    orders: Order[],
    stats: { totalSpent: number; totalOrders: number },
    businessProfile: BusinessProfile
) => {
    renderAndPrint(React.createElement(PrintableCustomerStatement, { customer, orders, stats, businessProfile }));
};

export const printMenu = (products: Product[], businessProfile: BusinessProfile) => {
    renderAndPrint(React.createElement(PrintableMenu, { products, businessProfile }));
};

export const printJoiningLetter = (staff: Staff, businessProfile: BusinessProfile) => {
    renderAndPrint(React.createElement(PrintableJoiningLetter, { staff, businessProfile }));
};

export interface DailyReportData {
    date: Date;
    totalSales: number;
    totalExpenses: number;
    netProfit: number;
    totalOrders: number;
    topItems: { name: string; quantity: number }[];
}

export const printDailyReport = (data: DailyReportData, businessProfile: BusinessProfile) => {
    renderAndPrint(React.createElement(PrintableDailyReport, { data, businessProfile }));
};

export const printKOT = (kot: KOT, businessProfile: BusinessProfile) => {
    renderAndPrint(React.createElement(PrintableKOT, { kot, businessProfile }));
};

export const printTodayDeliveryManifest = (manifestItems: any[], businessProfile: BusinessProfile) => {
    renderAndPrint(React.createElement(PrintableTodayDeliveryManifest, { items: manifestItems, businessProfile }));
};

export const printClosingReport = (closing: CashClosing, businessProfile: BusinessProfile) => {
    renderAndPrint(React.createElement(PrintableClosingReport, { closing, businessProfile }));
};
