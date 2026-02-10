"use client";

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

interface PaymentMethod {
    _id: string;
    label: string;
    customerToken: string;
    isDefault: boolean;
}

interface Transaction {
    _id: string;
    orderId: string;
    items: string;
    currency: string;
    amount: number;
    status: string;
    createdAt: string;
}

export default function DriverWalletPage() {
    const [balance, setBalance] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [customerToken, setCustomerToken] = useState('');
    const [label, setLabel] = useState('');
    const [chargeAmount, setChargeAmount] = useState('');
    const [chargeItems, setChargeItems] = useState('');
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchWallet = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/wallet', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setBalance(data.balance || 0);
        setTotalSpent(data.totalSpent || 0);
        setMethods(data.methods || []);
        setTransactions(data.transactions || []);
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    const handleAddMethod = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/methods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ customerToken, label })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to add method');
            }
            setCustomerToken('');
            setLabel('');
            setShowAdd(false);
            await fetchWallet();
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleCharge = async () => {
        if (!selectedMethodId || !chargeAmount) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/charge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    paymentMethodId: selectedMethodId,
                    amount: Number(chargeAmount),
                    currency: 'LKR',
                    items: chargeItems || 'Mechanic.LK charge'
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || data.gateway?.msg || 'Charge failed');
            }
            setChargeAmount('');
            setChargeItems('');
            await fetchWallet();
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <div className="px-6 pt-8 pb-4">
                <h1 className="text-2xl font-black text-text-main dark:text-white">Wallet</h1>
                <p className="text-sm text-text-sub dark:text-gray-400">Manage PayHere tokenized payments.</p>
            </div>

            <div className="px-6 space-y-4">
                {error && (
                    <div className="rounded-xl bg-red-100 text-red-600 p-3 text-sm font-bold">{error}</div>
                )}

                <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-6 text-white shadow-lg">
                    <p className="text-sm opacity-80">Current Balance</p>
                    <p className="text-3xl font-black mt-2">LKR {balance.toFixed(2)}</p>
                    <p className="text-xs opacity-70 mt-1">Total spent: LKR {totalSpent.toFixed(2)}</p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-text-main dark:text-white">Payment Methods</h2>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-glow hover:bg-primary/90"
                        >
                            Add
                        </button>
                    </div>
                    {methods.length === 0 ? (
                        <p className="text-sm text-text-sub dark:text-gray-400 mt-2">No tokens saved yet.</p>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {methods.map((method) => (
                                <label key={method._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2">
                                    <div>
                                        <p className="text-sm font-bold text-text-main dark:text-white">{method.label}</p>
                                        <p className="text-xs text-text-sub dark:text-gray-400">Token ending {method.customerToken.slice(-6)}</p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="method"
                                        checked={selectedMethodId === method._id}
                                        onChange={() => setSelectedMethodId(method._id)}
                                    />
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-text-main dark:text-white">Charge Customer</h2>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <input
                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            placeholder="Amount (LKR)"
                            value={chargeAmount}
                            onChange={(e) => setChargeAmount(e.target.value)}
                        />
                        <input
                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            placeholder="Items"
                            value={chargeItems}
                            onChange={(e) => setChargeItems(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleCharge}
                        disabled={loading || !selectedMethodId}
                        className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                    >
                        {loading ? 'Processing...' : 'Charge Now'}
                    </button>
                </div>

                <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-text-main dark:text-white">Recent Transactions</h2>
                    {transactions.length === 0 ? (
                        <p className="text-sm text-text-sub dark:text-gray-400 mt-2">No transactions yet.</p>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {transactions.map((tx) => (
                                <div key={tx._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2">
                                    <div>
                                        <p className="text-sm font-bold text-text-main dark:text-white">{tx.items}</p>
                                        <p className="text-xs text-text-sub dark:text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{tx.currency} {tx.amount.toFixed(2)}</p>
                                        <p className="text-xs text-text-sub dark:text-gray-400">{tx.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-card-dark p-5 shadow-xl">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-text-main dark:text-white">Add PayHere Token</h3>
                                <p className="text-sm text-text-sub dark:text-gray-400">Paste customer_token from preapproval.</p>
                            </div>
                            <button
                                onClick={() => setShowAdd(false)}
                                className="rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <input
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm mb-3"
                            placeholder="Customer Token"
                            value={customerToken}
                            onChange={(e) => setCustomerToken(e.target.value)}
                        />
                        <input
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            placeholder="Label (optional)"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                        <button
                            onClick={handleAddMethod}
                            disabled={loading}
                            className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                        >
                            {loading ? 'Saving...' : 'Save Token'}
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
