"use client";

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

interface HistoryItem {
    id: string;
    type: string;
    title: string;
    status: string;
    date: string;
    amount?: number;
    sourceType?: 'auction' | 'service' | 'parking';
    raw?: any;
}

export default function DriverHistoryPage() {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMode, setPaymentMode] = useState<'payhere' | 'cash'>('payhere');
    const [methods, setMethods] = useState<{ _id: string; label: string; customerToken: string }[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentItems, setPaymentItems] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentTarget, setPaymentTarget] = useState<{ sourceType: 'auction' | 'service' | 'parking'; sourceId: string; status: string } | null>(null);

    const fetchAll = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const [auctionsRes, serviceRes, bookingRes, emergencyRes] = await Promise.all([
            fetch('http://mechaniclk-devthon-production.up.railway.app/api/auctions/driver', { headers }),
            fetch('http://mechaniclk-devthon-production.up.railway.app/api/service-requests/my', { headers }),
            fetch('http://mechaniclk-devthon-production.up.railway.app/api/bookings/my', { headers }),
            fetch('http://mechaniclk-devthon-production.up.railway.app/api/emergency/my', { headers })
        ]);

        const [auctions, services, bookings, emergencies] = await Promise.all([
            auctionsRes.json(),
            serviceRes.json(),
            bookingRes.json(),
            emergencyRes.json()
        ]);

        const mapped: HistoryItem[] = [];

        if (Array.isArray(auctions)) {
            auctions.forEach((a: any) => {
                const acceptedBid = a.bids?.find((b: any) => b._id === a.acceptedBid);
                mapped.push({
                    id: a._id,
                    type: 'Auction',
                    title: `${a.vehicle?.year} ${a.vehicle?.make} ${a.vehicle?.model}`,
                    status: a.status,
                    date: a.createdAt,
                    amount: acceptedBid?.amount,
                    sourceType: 'auction',
                    raw: a
                });
            });
        }

        if (Array.isArray(services)) {
            services.forEach((s: any) => {
                mapped.push({
                    id: s._id,
                    type: 'Service',
                    title: s.issueDescription,
                    status: s.status,
                    date: s.createdAt,
                    amount: undefined,
                    sourceType: 'service',
                    raw: s
                });
            });
        }

        if (Array.isArray(bookings)) {
            bookings.forEach((b: any) => {
                mapped.push({
                    id: b._id,
                    type: 'Parking',
                    title: b.parkingSpot?.title || 'Parking Booking',
                    status: b.status,
                    date: b.createdAt,
                    amount: b.totalPrice,
                    sourceType: 'parking',
                    raw: b
                });
            });
        }

        if (Array.isArray(emergencies)) {
            emergencies.forEach((e: any) => {
                mapped.push({
                    id: e._id,
                    type: 'Emergency',
                    title: e.issueDescription,
                    status: e.status,
                    date: e.createdAt,
                    raw: e
                });
            });
        }

        mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setItems(mapped);
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchMethods = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://mechaniclk-devthon-production.up.railway.app/api/payments/methods', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
            setMethods(data);
        }
    };

    const openPayment = (item: HistoryItem) => {
        if (!item.sourceType) return;
        setPaymentTarget({ sourceType: item.sourceType, sourceId: item.id, status: item.status });
        setPaymentMode('payhere');
        setSelectedMethodId('');
        setPaymentAmount(item.amount ? String(item.amount) : '');
        setPaymentItems(item.type === 'Parking' ? 'Parking booking' : item.type === 'Service' ? 'Service request' : 'Auction repair');
        setPaymentError('');
        setShowPayment(true);
        fetchMethods();
    };

    const getStatusEndpoint = (sourceType: 'auction' | 'service' | 'parking', id: string) => {
        if (sourceType === 'auction') return `http://mechaniclk-devthon-production.up.railway.app/api/auctions/${id}/status`;
        if (sourceType === 'service') return `http://mechaniclk-devthon-production.up.railway.app/api/service-requests/${id}/status`;
        return `http://mechaniclk-devthon-production.up.railway.app/api/bookings/${id}/status`;
    };

    const getCompletedStatus = (sourceType: 'auction' | 'service' | 'parking') => {
        if (sourceType === 'auction') return 'Completed';
        return 'completed';
    };

    const handleCompletePayment = async () => {
        if (!paymentTarget) return;
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

                const res = await fetch('http://mechaniclk-devthon-production.up.railway.app/api/payments/charge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        paymentMethodId: selectedMethodId,
                        amount: Number(paymentAmount),
                        currency: 'LKR',
                        items: paymentItems,
                        sourceType: paymentTarget.sourceType,
                        sourceId: paymentTarget.sourceId
                    })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || data.gateway?.msg || 'Charge failed');
                }
            } else {
                const res = await fetch('http://mechaniclk-devthon-production.up.railway.app/api/payments/cash', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        amount: Number(paymentAmount),
                        currency: 'LKR',
                        items: paymentItems,
                        sourceType: paymentTarget.sourceType,
                        sourceId: paymentTarget.sourceId
                    })
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to record cash payment');
                }
            }

            await fetch(getStatusEndpoint(paymentTarget.sourceType, paymentTarget.sourceId), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: getCompletedStatus(paymentTarget.sourceType) })
            });

            setShowPayment(false);
            setPaymentTarget(null);
            setPaymentAmount('');
            setPaymentItems('');
            await fetchAll();
        } catch (err: any) {
            setPaymentError(err.message || 'Something went wrong');
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <div className="px-6 pt-8 pb-4">
                <h1 className="text-2xl font-black text-text-main dark:text-white">History</h1>
                <p className="text-sm text-text-sub dark:text-gray-400">Your latest activity across services.</p>
            </div>

            <div className="px-6 space-y-3">
                {loading ? (
                    <div className="text-center text-sm text-text-sub dark:text-gray-400 py-6">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="text-center text-sm text-text-sub dark:text-gray-400 py-6">No history yet.</div>
                ) : (
                    items.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wide">{item.type}</p>
                                    <p className="font-bold text-text-main dark:text-white">{item.title}</p>
                                </div>
                                <span className="text-xs font-bold text-text-sub dark:text-gray-400">{item.status}</span>
                            </div>
                            <p className="text-xs text-text-sub dark:text-gray-500 mt-2">{new Date(item.date).toLocaleString()}</p>
                            {item.sourceType && ((item.type === 'Auction' && item.status === 'Accepted') || (item.type === 'Service' && (item.status === 'accepted' || item.status === 'in_progress')) || (item.type === 'Parking' && (item.status === 'pending' || item.status === 'confirmed'))) && (
                                <button
                                    onClick={() => openPayment(item)}
                                    className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-primary/90"
                                >
                                    Pay & Complete
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {showPayment && paymentTarget && (
                <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-card-dark p-5 shadow-xl">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-text-main dark:text-white">Complete & Pay</h3>
                                <p className="text-sm text-text-sub dark:text-gray-400">{paymentTarget.sourceType} payment</p>
                            </div>
                            <button
                                onClick={() => setShowPayment(false)}
                                className="rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
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
                                className={`rounded-full px-3 py-1 text-xs font-bold ${paymentMode === 'payhere' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                PayHere
                            </button>
                            <button
                                onClick={() => setPaymentMode('cash')}
                                className={`rounded-full px-3 py-1 text-xs font-bold ${paymentMode === 'cash' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
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
                            onClick={handleCompletePayment}
                            disabled={paymentLoading}
                            className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                        >
                            {paymentLoading ? 'Processing...' : paymentMode === 'cash' ? 'Record Cash & Complete' : 'Pay & Complete'}
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
