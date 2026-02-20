import React, { useState } from 'react';
import { MainView, Order, Expense, Purchase, Vendor, Product, PurchaseItem, OrderItem } from '../types';
import SalesIcon from '../components/icons/SalesIcon';
import ExpenseIcon from '../components/icons/ExpenseIcon';
import ShoppingBagIcon from '../components/icons/ShoppingBagIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import TrashIcon from '../components/icons/TrashIcon';

interface HistoricalDataEntryScreenProps {
    onBack: () => void;
    onAddHistoricalOrder: (order: Order) => void;
    onAddHistoricalExpense: (expense: Omit<Expense, 'id'>) => void;
    onAddHistoricalPurchase: (purchase: Omit<Purchase, 'id'>) => void;
    vendors: Vendor[];
    products: Product[];
    isDesktop?: boolean;
}

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const expenseCategories = ['Supplies', 'Rent', 'Utilities', 'Wages', 'Marketing', 'Maintenance', 'Other'];

const commonDate = new Date().toISOString().split('T')[0];

type SaleItem = { productName: string; quantity: number; rate: number };

const SaleForm: React.FC<{onSave: (order: Order) => void, keepDate: boolean, products: Product[]}> = ({ onSave, keepDate, products }) => {
    const [date, setDate] = useState(commonDate);
    const [items, setItems] = useState<SaleItem[]>([{ productName: '', quantity: 1, rate: 0 }]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank'>('Cash');
    const [customerName, setCustomerName] = useState('');
    
    const handleItemChange = (index: number, field: keyof SaleItem, value: string | number) => {
        const newItems = [...items];
        const item = newItems[index];

        if (field === 'productName' && typeof value === 'string') {
            item.productName = value;
            const product = products.find(p => p.name.toLowerCase() === value.toLowerCase());
            if (product) {
                item.rate = product.price;
            }
        } else if (field === 'quantity' || field === 'rate') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            (item as any)[field] = isNaN(numValue) ? '' : numValue;
        }
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { productName: '', quantity: 1, rate: 0 }]);
    const removeItem = (index: number) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validItems = items.filter(item => item.productName.trim() && item.quantity > 0 && item.rate > 0);
        if (validItems.length === 0) {
            alert('Please add at least one valid item with a name, quantity, and rate.');
            return;
        }

        const totalAmount = validItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        
        const orderItems: OrderItem[] = validItems.map((item, i) => {
            const existingProduct = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
            const product: Product = existingProduct || {
                id: `hist-prod-${Date.now()}-${i}`,
                name: item.productName,
                category: 'Historical',
                price: item.rate,
                trackStock: false,
            };
            return { product, quantity: item.quantity };
        });

        const newOrder: Order = {
            id: `hist-ord-${Date.now()}`,
            type: 'Takeaway',
            items: orderItems,
            status: 'Completed',
            timestamp: new Date(date + 'T12:00:00Z').getTime(),
            customerName: customerName || 'Historical Customer',
            customerPhone: '',
            discount: 0,
            discountType: 'AMOUNT',
            paymentMethod: paymentMethod,
            grandTotal: totalAmount,
        };
        onSave(newOrder);
        setItems([{ productName: '', quantity: 1, rate: 0 }]);
        setCustomerName('');
        if (!keepDate) setDate(commonDate);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <datalist id="product-list">
                {products.map(p => <option key={p.id} value={p.name} />)}
            </datalist>
            <FormInput label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Items</h3>
                {items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-lg space-y-2">
                        <div className="flex items-center space-x-2">
                            <input list="product-list" type="text" placeholder="Item Name" value={item.productName} onChange={e => handleItemChange(index, 'productName', e.target.value)} className="flex-grow p-2 border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-secondary" />
                            <button type="button" onClick={() => removeItem(index)} className="text-red-500 disabled:opacity-50 shrink-0" disabled={items.length <= 1}><TrashIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-1/4 p-2 border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-secondary" />
                            <span className="text-gray-500">x</span>
                            <input type="number" step="0.01" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className="w-1/3 p-2 border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-secondary" />
                            <span className="text-gray-500">=</span>
                            <span className="flex-grow text-sm font-semibold text-right text-text-primary p-2">₹{(item.quantity * item.rate).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addItem} className="text-sm font-semibold text-primary">+ Add Item</button>
            </div>
            <FormSelect label="Payment Method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as 'Cash' | 'Bank')} options={['Cash', 'Bank']} />
            <FormInput label="Customer Name (Optional)" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g., John Doe" />
            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-800 transition-colors">Save Sale & Add Another</button>
        </form>
    );
};

const ExpenseForm: React.FC<{onSave: (expense: Omit<Expense, 'id'>) => void, keepDate: boolean}> = ({ onSave, keepDate }) => {
    const [date, setDate] = useState(commonDate);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [category, setCategory] = useState(expenseCategories[0]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof amount !== 'number' || amount <= 0 || !title.trim()) {
            alert('Please enter a valid title and amount.');
            return;
        }
        onSave({ date, title, amount, category });
        setTitle('');
        setAmount('');
        setCategory(expenseCategories[0]);
        if (!keepDate) setDate(commonDate);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <FormInput label="Expense Title" type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Office Supplies" />
            <FormInput label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} required placeholder="e.g., 1500" />
            <FormSelect label="Category" value={category} onChange={e => setCategory(e.target.value)} options={expenseCategories} />
            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-800 transition-colors">Save Expense & Add Another</button>
        </form>
    );
};

type PurchaseEntryItem = Omit<PurchaseItem, 'id'>;

const PurchaseForm: React.FC<{onSave: (purchase: Omit<Purchase, 'id'>) => void, vendors: Vendor[], keepDate: boolean}> = ({ onSave, vendors, keepDate }) => {
    const [date, setDate] = useState(commonDate);
    const [vendorId, setVendorId] = useState('');
    const [items, setItems] = useState<PurchaseEntryItem[]>([{ itemName: '', quantity: 1, rate: 0 }]);
    const [paidAmount, setPaidAmount] = useState<number | ''>('');
    
    const totalAmount = React.useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.rate, 0), [items]);

    const handleItemChange = (index: number, field: keyof PurchaseEntryItem, value: string | number) => {
        const newItems = [...items];
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        (newItems[index] as any)[field] = field === 'itemName' ? value : (isNaN(numValue) ? 0 : numValue);
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { itemName: '', quantity: 1, rate: 0 }]);
    const removeItem = (index: number) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validItems = items.filter(item => item.itemName.trim() && item.quantity > 0 && item.rate > 0);
        if (validItems.length === 0) {
            alert('Please add at least one valid item.');
            return;
        }

        const totalAmount = validItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        
        const finalPaidAmount = typeof paidAmount === 'number' && !isNaN(paidAmount) ? paidAmount : totalAmount;
        const paymentMethod = finalPaidAmount >= totalAmount ? 'Cash' : (finalPaidAmount > 0 ? 'Cash' : 'Credit');

        const newPurchase: Omit<Purchase, 'id'> = {
            vendorId: vendorId || undefined,
            items: validItems.map(item => ({...item, id: `hist-purch-item-${Date.now()}-${Math.random()}`})),
            timestamp: new Date(date + 'T12:00:00Z').getTime(),
            totalAmount,
            paidAmount: finalPaidAmount,
            paymentMethod,
        };
        onSave(newPurchase);
        
        setItems([{ itemName: '', quantity: 1, rate: 0 }]);
        setVendorId('');
        setPaidAmount('');
        if (!keepDate) setDate(commonDate);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <FormSelect label="Vendor (Optional)" value={vendorId} onChange={e => setVendorId(e.target.value)} options={[{ value: '', label: 'General Purchase' }, ...vendors.map(v => ({ value: v.id, label: v.name }))]} />
            
             <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Items</h3>
                {items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-lg space-y-2">
                        <div className="flex items-center space-x-2">
                            <input type="text" placeholder="Item Name" value={item.itemName} onChange={e => handleItemChange(index, 'itemName', e.target.value)} className="flex-grow p-2 border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-secondary" />
                            <button type="button" onClick={() => removeItem(index)} className="text-red-500 disabled:opacity-50 shrink-0" disabled={items.length <= 1}><TrashIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-1/4 p-2 border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-secondary" />
                            <span className="text-gray-500">x</span>
                            <input type="number" step="0.01" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className="w-1/3 p-2 border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-secondary" />
                            <span className="text-gray-500">=</span>
                            <span className="flex-grow text-sm font-semibold text-right text-text-primary p-2">₹{(item.quantity * item.rate).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addItem} className="text-sm font-semibold text-primary">+ Add Item</button>
            </div>
            
            <FormInput label="Amount Paid (₹)" type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder={`Total: ${totalAmount.toFixed(2)}`} />
            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-800 transition-colors">Save Purchase & Add Another</button>
        </form>
    );
};


const HistoricalDataEntryScreen: React.FC<HistoricalDataEntryScreenProps> = ({ onBack, onAddHistoricalOrder, onAddHistoricalExpense, onAddHistoricalPurchase, vendors, products, isDesktop }) => {
    const [activeTab, setActiveTab] = useState<'sale' | 'expense' | 'purchase'>('sale');
    const [successMessage, setSuccessMessage] = useState('');
    const [keepDate, setKeepDate] = useState(true);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };
    
    const tabs = [
        { id: 'sale', label: 'Sale', icon: <SalesIcon className="h-5 w-5 mr-2"/> },
        { id: 'expense', label: 'Expense', icon: <ExpenseIcon className="h-5 w-5 mr-2"/> },
        { id: 'purchase', label: 'Purchase', icon: <ShoppingBagIcon className="h-5 w-5 mr-2"/> },
    ];

    return (
        <div className="p-4 pb-24 bg-background min-h-full">
             {successMessage && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center animate-fade-in">
                    <CheckCircleIcon className="h-5 w-5 mr-2"/>
                    <span>{successMessage}</span>
                </div>
             )}
            <header className="mb-4 flex items-center justify-between h-12">
                <button onClick={onBack} className="flex items-center space-x-1.5 text-gray-600 hover:text-primary transition-colors p-2 -ml-2 rounded-lg">
                    <ArrowLeftIcon className="h-6 w-6"/>
                    <span className="font-bold text-lg">Back</span>
                </button>
                <h1 className="text-xl font-bold text-text-primary text-center whitespace-nowrap px-2 truncate">Historical Data Entry</h1>
                <div className="opacity-0 pointer-events-none" aria-hidden="true">
                    <div className="flex items-center space-x-1.5 text-gray-600 p-2 -ml-2 rounded-lg">
                        <ArrowLeftIcon className="h-6 w-6"/>
                        <span className="font-bold text-lg">Back</span>
                    </div>
                </div>
            </header>

            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                <div className="flex justify-between items-center">
                    <label htmlFor="keepDate" className="text-sm font-medium text-gray-700">Keep date after saving</label>
                    <input type="checkbox" id="keepDate" checked={keepDate} onChange={() => setKeepDate(!keepDate)} className="h-5 w-5 rounded text-primary focus:ring-primary"/>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enable this for faster entry from a daybook.</p>
            </div>

            <div className="flex space-x-2 mb-4">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-700 border'}`}>
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm">
                {activeTab === 'sale' && <SaleForm onSave={(order) => { onAddHistoricalOrder(order); showSuccess(`Sale on ${new Date(order.timestamp).toLocaleDateString()} added!`); }} keepDate={keepDate} products={products} />}
                {activeTab === 'expense' && <ExpenseForm onSave={(expense) => { onAddHistoricalExpense(expense); showSuccess(`Expense on ${expense.date} added!`); }} keepDate={keepDate} />}
                {activeTab === 'purchase' && <PurchaseForm onSave={(purchase) => { onAddHistoricalPurchase(purchase); showSuccess(`Purchase on ${new Date(purchase.timestamp).toLocaleDateString()} added!`); }} vendors={vendors} keepDate={keepDate} />}
            </div>
        </div>
    );
};

// --- Reusable Form Components ---

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const FormInput: React.FC<FormInputProps> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary" style={{ colorScheme: 'light' }}/>
    </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: (string | { value: string; label: string })[];
}
const FormSelect: React.FC<FormSelectProps> = ({ label, options, ...props }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary">
            {options.map(opt => (
                typeof opt === 'string' 
                ? <option key={opt} value={opt}>{opt}</option>
                : <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);


export default HistoricalDataEntryScreen;
