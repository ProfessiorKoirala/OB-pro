import React, { useState, useEffect, useMemo } from 'react';
import { Order } from '../../types';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import TruckIcon from '../icons/TruckIcon';
import CalendarIcon from '../icons/CalendarIcon';
import CashIcon from '../icons/CashIcon';
import ReceiptIcon from '../icons/ReceiptIcon';
import CircularMenu, { CircularMenuItem } from './CircularMenu';
import BanIcon from '../icons/BanIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import RefundIcon from '../icons/RefundIcon';

const KOTIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v4" />
    </svg>
);


interface OrderCardProps {
    order: Order;
    contactName: string;
    onViewBill: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onCancel: (order: Order) => void;
    onUpdateStatus: (orderId: string, status: 'Out for Delivery' | 'Completed' | 'Returned' | 'Cancelled') => void;
    isCompleting?: boolean;
    onViewKots: () => void;
}

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const baseClass = "text-xs font-bold px-2 py-1 rounded-full";
    switch (status) {
        case 'Pending':
            return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Pending</span>;
        case 'Out for Delivery':
            return <span className={`${baseClass} bg-blue-100 text-blue-800`}>In Delivery</span>;
        case 'Completed':
            return <span className={`${baseClass} bg-green-100 text-green-800`}>Completed</span>;
        case 'Cancelled':
            return <span className={`${baseClass} bg-red-100 text-red-800`}>Cancelled</span>;
        case 'Returned':
            return <span className={`${baseClass} bg-purple-100 text-purple-800`}>Returned</span>;
        default:
            return null;
    }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, contactName, onViewBill, onEdit, onDelete, onCancel, onUpdateStatus, isCompleting, onViewKots }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [internalStage, setInternalStage] = useState<'idle' | 'processing' | 'succeeded'>('idle');

    useEffect(() => {
        if (isCompleting) {
            setInternalStage('processing');
            const timer1 = setTimeout(() => setInternalStage('succeeded'), 1200);
            const timer2 = setTimeout(() => {
                setInternalStage('idle');
            }, 2900); 

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else {
             setInternalStage('idle');
        }
    }, [isCompleting]);

    const actions: CircularMenuItem[] = [];

    actions.push({ label: 'View Bill', icon: <ReceiptIcon className="h-7 w-7" />, onClick: onViewBill });
    actions.push({ label: 'KOTs', icon: <KOTIcon className="h-7 w-7" />, onClick: onViewKots });
    
    switch (order.status) {
        case 'Pending':
            actions.push({ label: 'Edit', icon: <PencilIcon className="h-7 w-7" />, onClick: onEdit });
            actions.push({ label: 'Deliver', icon: <TruckIcon className="h-7 w-7 text-blue-600" />, onClick: () => onUpdateStatus(order.id, 'Out for Delivery'), colorClass: 'text-blue-600' });
            actions.push({ label: 'Mistake', icon: <BanIcon className="h-7 w-7 text-red-600" />, onClick: () => onCancel(order), colorClass: 'text-red-600' });
            break;
        case 'Out for Delivery':
             actions.push({ label: 'Complete', icon: <CheckCircleIcon className="h-7 w-7 text-green-600" />, onClick: () => onUpdateStatus(order.id, 'Completed'), colorClass: 'text-green-600' });
             actions.push({ label: 'Return', icon: <RefundIcon className="h-7 w-7 text-purple-600" />, onClick: () => onUpdateStatus(order.id, 'Returned'), colorClass: 'text-purple-600' });
             actions.push({ label: 'Mistake', icon: <BanIcon className="h-7 w-7 text-red-600" />, onClick: () => onCancel(order), colorClass: 'text-red-600' });
            break;
        case 'Completed':
            actions.push({ label: 'Return', icon: <RefundIcon className="h-7 w-7 text-purple-600" />, onClick: () => onUpdateStatus(order.id, 'Returned'), colorClass: 'text-purple-600' });
            actions.push({ label: 'Delete', icon: <TrashIcon className="h-7 w-7 text-red-600" />, onClick: onDelete, colorClass: 'text-red-600' });
            break;
        case 'Cancelled':
        case 'Returned':
            actions.push({ label: 'Delete', icon: <TrashIcon className="h-7 w-7 text-red-600" />, onClick: onDelete, colorClass: 'text-red-600' });
            break;
    }

    const animationClass = isCompleting ? `completing-delivery-card ${internalStage}` : '';

    const confettiParticles = useMemo(() => Array.from({ length: 20 }).map((_, i) => {
        const angle = Math.random() * 360;
        const radius = Math.random() * 80 + 40;
        const x = Math.cos(angle * (Math.PI / 180)) * radius;
        const y = Math.sin(angle * (Math.PI / 180)) * radius;
        const r = Math.random() * 360;
        const color = ['#FBBF24', '#F87171', '#60A5FA', '#34D399'][Math.floor(Math.random() * 4)];
        return (
            <div 
              key={i} 
              className="confetti-particle" 
              style={{ 
                '--x': `${x}px`, 
                '--y': `${y}px`, 
                '--r': `${r}deg`,
                background: color,
                transitionDelay: `${Math.random() * 0.1}s`
              } as React.CSSProperties}
            />
        );
    }), []);

    return (
        <>
            <CircularMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} actions={actions} />
             <div className={`bg-white p-3 rounded-xl shadow-sm relative ${animationClass}`} data-order-id={order.id}>
                {isCompleting && (
                    <div className="animation-content">
                        <div className="processing-spinner">
                            <div className="spinner"></div>
                        </div>
                        <div className="success-checkmark">
                            <CheckCircleIcon className="w-8 h-8 text-white" />
                        </div>
                        {internalStage === 'succeeded' && (
                            <div className="confetti-container">
                                {confettiParticles}
                            </div>
                        )}
                   </div>
                )}
                <div className="order-card-content">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-text-primary">Order #{order.id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-text-secondary">{contactName}</p>
                            <p className="text-xs text-gray-400">{new Date(order.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-right flex items-center space-x-2">
                            <div>
                                <p className="font-bold text-lg text-primary">{formatCurrency(order.grandTotal || 0)}</p>
                                <StatusBadge status={order.status} />
                            </div>
                             <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 11-2 0 1 1 0 010 2z" /></svg>
                            </button>
                        </div>
                    </div>

                    {(order.deliveryDate || (order.advanceAmount || 0) > 0 || (order.deliveryFee || 0) > 0 || order.customerAddress) && (
                        <div className="border-t mt-3 pt-2 text-xs text-text-secondary space-y-1">
                            {order.customerAddress && (
                                <div className="flex items-start space-x-1.5 mb-1 text-blue-600 font-semibold italic">
                                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    <span className="truncate">{order.customerAddress}</span>
                                </div>
                            )}
                            {order.deliveryDate &&
                                <div className="flex items-center space-x-1.5">
                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    <span>Delivery on: <strong>{new Date(order.deliveryDate + 'T00:00:00').toLocaleDateString('en-GB')}</strong></span>
                                </div>
                            }
                            {(order.advanceAmount || 0) > 0 &&
                                <div className="flex items-center space-x-1.5">
                                    <CashIcon className="h-4 w-4 text-gray-500" />
                                    <span>Advance Paid: <strong>{formatCurrency(order.advanceAmount!)}</strong></span>
                                </div>
                            }
                            {(order.deliveryFee || 0) > 0 &&
                                <div className="flex items-center space-x-1.5">
                                    <TruckIcon className="h-4 w-4 text-gray-500" />
                                    <span>Delivery Fee: <strong>{formatCurrency(order.deliveryFee!)}</strong></span>
                                </div>
                            }
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OrderCard;