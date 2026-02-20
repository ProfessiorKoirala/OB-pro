import React, { useState, useMemo } from 'react';
import { Order, Product, Creditor, Customer, Discount, Vendor, Table, BusinessSettings, BusinessProfile } from '../types';
import OrderEditor from '../components/sales/OrderEditor';
import { calculateOrderTotals } from '../utils/calculationUtils';

interface OrderCreationScreenProps {
    products: Product[];
    tables: Table[];
    creditors: Creditor[];
    customers: Customer[];
    vendors: Vendor[];
    discounts: Discount[];
    isVatEnabled: boolean;
    onSave: (order: Order) => void;
    onCancel: () => void;
    onAddProductClick: () => void;
    isKotEnabled: boolean;
    onUpdateSettings: (updates: Partial<BusinessSettings>) => void;
    businessSettings: BusinessSettings;
    // Fixed: Added businessProfile to interface
    businessProfile: BusinessProfile;
}

const createNewOrder = (): Order => ({
    id: `ord-${Date.now()}`,
    type: 'Order',
    items: [],
    status: 'Pending',
    timestamp: Date.now(),
    customerName: '',
    customerPhone: '',
    discount: 0,
    discountType: 'PERCENT',
});

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

const OrderCreationScreen: React.FC<OrderCreationScreenProps> = (props) => {
    const { onSave, onCancel, ...restOfProps } = props;
    const [order, setOrder] = useState<Order>(createNewOrder);

    const { grandTotal } = useMemo(() => calculateOrderTotals(order, props.isVatEnabled), [order, props.isVatEnabled]);

    const handleSave = () => {
        // Before saving, ensure the final grand total is calculated and set on the order object itself
        const finalOrder = { ...order, grandTotal };
        onSave(finalOrder);
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Fixed: Pass all restOfProps including businessProfile down to OrderEditor */}
            <OrderEditor
                order={order}
                onUpdateOrder={setOrder}
                showFooter={false}
                onBack={onCancel}
                // These are needed by the component but won't be used since the footer is hidden
                onCheckout={() => {}} 
                isTableOccupied={false}
                {...restOfProps}
            />

            <footer className="bg-white p-4 shadow-t-lg border-t shrink-0">
                <button
                    onClick={handleSave}
                    disabled={order.items.length === 0}
                    className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <span>Save Order</span>
                    <span className="ml-2 font-semibold bg-white/20 px-2 py-0.5 rounded-md text-sm">{formatCurrency(grandTotal)}</span>
                </button>
            </footer>
        </div>
    );
};

export default OrderCreationScreen;