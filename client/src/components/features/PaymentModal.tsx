"use client";

import React, { useEffect, useState } from 'react';

interface PaymentMethod {
    _id: string;
    label: string;
    customerToken: string;
}

interface PaymentModalProps {
    title: string;
    subtitle: string;
    defaultAmount?: string;
    defaultItems?: string;
    sourceType: 'auction' | 'service' | 'parking';
    sourceId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({
    title,
    subtitle,
    defaultAmount = '',
    defaultItems = '',
    sourceType,
    sourceId,
    onClose,
    onSuccess,
}: PaymentModalProps) {
    const [paymentMode, setPaymentMode] = useState<'payhere' | 'cash'>('payhere');
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState(defaultAmount);
    const [paymentItems, setPaymentItems] = useState(defaultItems);
    const [paymentError, setPaymentError] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        const fetchMethods = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/methods', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) setMethods(data);
            } catch { /* ignore */ }
        };
        fetchMethods();
    }, []);

    const handlePay = async () => {
        if (!paymentAmount) {
            setPaymentError('Amount is required.');
            return;
        }
        setPaymentLoading(true);
        setPaymentError('');

        try {
            const token = localStorage.getItem('token');
            if (paymentMode === 'payhere') {
                if (!selectedMethodId) {
                    setPaymentError('Please select a payment method.');
                    setPaymentLoading(false);
                    return;
                }
                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/charge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        paymentMethodId: selectedMethodId,
                        amount: Number(paymentAmount),
                        currency: 'LKR',
                        items: paymentItems || 'Mechanic.LK charge',
                        sourceType,
                        sourceId
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || data.gateway?.msg || 'Charge failed');
            } else {
                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/cash', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        amount: Number(paymentAmount),
                        currency: 'LKR',
                        items: paymentItems || 'Cash payment',
                        sourceType,
                        sourceId
                    })
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to record cash payment');
                }
            }
            onSuccess();
        } catch (err: any) {
            setPaymentError(err.message || 'Something went wrong');
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-card-dark p-5 shadow-xl">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-text-main dark:text-white">{title}</h3>
                        <p className="text-sm text-text-sub dark:text-gray-400">{subtitle}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {paymentError && (
                    <div className="mb-3 rounded-xl bg-red-100 text-red-600 p-2 text-xs font-bold">{paymentError}</div>
                )}

                <div className="mb-3 flex items-center gap-3">
                    <label className="text-xs font-bold uppercase tracking-wide text-text-sub">Mode</label>
                    <button
                        onClick={() => setPaymentMode('payhere')}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${paymentMode === 'payhere' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        PayHere
                    </button>
                    <button
                        onClick={() => setPaymentMode('cash')}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${paymentMode === 'cash' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                        Cash
                    </button>
                </div>

                {paymentMode === 'payhere' && (
                    <div className="mb-3">
                        <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-2">Payment Method</label>
                        <select
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            value={selectedMethodId}
                            onChange={(e) => setSelectedMethodId(e.target.value)}
                        >
                            <option value="">Select token</option>
                            {methods.map((method) => (
                                <option key={method._id} value={method._id}>
                                    {method.label} (ending {method.customerToken.slice(-6)})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <input
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                        placeholder="Amount (LKR)"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                    <input
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                        placeholder="Items"
                        value={paymentItems}
                        onChange={(e) => setPaymentItems(e.target.value)}
                    />
                </div>

                <button
                    onClick={handlePay}
                    disabled={paymentLoading}
                    className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                >
                    {paymentLoading ? 'Processing...' : paymentMode === 'cash' ? 'Record Cash & Complete' : 'Pay & Complete'}
                </button>
            </div>
        </div>
    );
}
