"use client";

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { Toast } from '@/components/ui/Toast';

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
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchWallet = async () => {
        try {
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
        } catch {
            setToast({ message: 'Failed to load wallet data', type: 'error' });
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    const handleAddMethod = async () => {
        if (!customerToken.trim()) {
            setToast({ message: 'Customer token is required', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/methods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ customerToken, label: label || 'My Card' })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to add method');
            }
            setCustomerToken('');
            setLabel('');
            setShowAdd(false);
            setToast({ message: 'Payment method added successfully!', type: 'success' });
            await fetchWallet();
        } catch (err: any) {
            setToast({ message: err.message || 'Something went wrong', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMethod = async (methodId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://mechaniclk-devthon-production.up.railway.app/api/payments/methods/${methodId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete');
            }
            setToast({ message: 'Payment method removed', type: 'success' });
            await fetchWallet();
        } catch (err: any) {
            setToast({ message: err.message || 'Something went wrong', type: 'error' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="px-6 pt-8 pb-4">
                <h1 className="text-2xl font-black text-text-main dark:text-white">Wallet</h1>
                <p className="text-sm text-text-sub dark:text-gray-400">Manage your payments and saved methods.</p>
            </div>

            <div className="px-6 space-y-4">
                {/* Balance Card */}
                <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-6 text-white shadow-lg">
                    <p className="text-sm opacity-80">Total Spent</p>
                    <p className="text-3xl font-black mt-2">LKR {totalSpent.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="material-symbols-outlined text-[18px] opacity-70">account_balance_wallet</span>
                        <p className="text-xs opacity-70">Balance: LKR {balance.toFixed(2)}</p>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-text-main dark:text-white">Payment Methods</h2>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-glow hover:bg-primary/90"
                        >
                            + Add
                        </button>
                    </div>
                    {methods.length === 0 ? (
                        <div className="mt-4 text-center py-6">
                            <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">credit_card_off</span>
                            <p className="text-sm text-text-sub dark:text-gray-400">No payment methods saved yet.</p>
                            <p className="text-xs text-text-sub dark:text-gray-500 mt-1">Add a PayHere token to make quick payments.</p>
                        </div>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {methods.map((method) => (
                                <div key={method._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-[16px]">credit_card</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-main dark:text-white">{method.label}</p>
                                            <p className="text-xs text-text-sub dark:text-gray-400">****{method.customerToken.slice(-4)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMethod(method._id)}
                                        className="text-red-400 hover:text-red-600 p-1"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-text-main dark:text-white">Recent Transactions</h2>
                    {transactions.length === 0 ? (
                        <div className="mt-4 text-center py-6">
                            <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">receipt_long</span>
                            <p className="text-sm text-text-sub dark:text-gray-400">No transactions yet.</p>
                        </div>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {transactions.map((tx) => (
                                <div key={tx._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-500 text-[16px]">receipt</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-main dark:text-white">{tx.items}</p>
                                            <p className="text-xs text-text-sub dark:text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-text-main dark:text-white">{tx.currency} {tx.amount.toFixed(2)}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Method Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-card-dark p-5 shadow-xl">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-text-main dark:text-white">Add Payment Method</h3>
                                <p className="text-sm text-text-sub dark:text-gray-400">Save a PayHere token for quick payments.</p>
                            </div>
                            <button
                                onClick={() => setShowAdd(false)}
                                className="rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-1">Label</label>
                                <input
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                    placeholder="e.g. My Visa Card"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-1">Customer Token</label>
                                <input
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-mono"
                                    placeholder="Paste your PayHere customer token"
                                    value={customerToken}
                                    onChange={(e) => setCustomerToken(e.target.value)}
                                />
                                <p className="text-[10px] text-text-sub dark:text-gray-500 mt-1">
                                    You can get this from a PayHere preapproval flow.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddMethod}
                            disabled={loading}
                            className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                        >
                            {loading ? 'Saving...' : 'Save Method'}
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
