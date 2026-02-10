"use client";

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { PaymentModal } from '@/components/features/PaymentModal';
import { Toast } from '@/components/ui/Toast';
import { SkeletonHistoryItem } from '@/components/ui/Skeleton';

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
    const [paymentTarget, setPaymentTarget] = useState<{ sourceType: 'auction' | 'service' | 'parking'; sourceId: string; amount: number; label: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchAll = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        try {
            const results = await Promise.allSettled([
                fetch('https://mechaniclk-devthon-production.up.railway.app/api/auctions/driver', { headers }).then(r => r.json()),
                fetch('https://mechaniclk-devthon-production.up.railway.app/api/service-requests/my', { headers }).then(r => r.json()),
                fetch('https://mechaniclk-devthon-production.up.railway.app/api/bookings/my', { headers }).then(r => r.json()),
                fetch('https://mechaniclk-devthon-production.up.railway.app/api/emergency/my', { headers }).then(r => r.json())
            ]);

            const auctions = results[0].status === 'fulfilled' ? results[0].value : [];
            const services = results[1].status === 'fulfilled' ? results[1].value : [];
            const bookings = results[2].status === 'fulfilled' ? results[2].value : [];
            const emergencies = results[3].status === 'fulfilled' ? results[3].value : [];

            const mapped: HistoryItem[] = [];

            if (Array.isArray(auctions)) {
                auctions.forEach((a: any) => {
                    const acceptedBid = a.bids?.find((b: any) => b._id === a.acceptedBid);
                    mapped.push({
                        id: a._id,
                        type: 'Auction',
                        title: `${a.vehicle?.year || ''} ${a.vehicle?.make || ''} ${a.vehicle?.model || ''}`.trim() || 'Auction',
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
                        title: s.issueDescription || 'Service Request',
                        status: s.status,
                        date: s.createdAt,
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
                        title: e.issueDescription || 'Emergency Request',
                        status: e.status,
                        date: e.createdAt,
                        raw: e
                    });
                });
            }

            mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setItems(mapped);
        } catch {
            setToast({ message: 'Failed to load history', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const getStatusEndpoint = (sourceType: 'auction' | 'service' | 'parking', id: string) => {
        if (sourceType === 'auction') return `https://mechaniclk-devthon-production.up.railway.app/api/auctions/${id}/status`;
        if (sourceType === 'service') return `https://mechaniclk-devthon-production.up.railway.app/api/service-requests/${id}/status`;
        return `https://mechaniclk-devthon-production.up.railway.app/api/bookings/${id}/status`;
    };

    const getCompletedStatus = (sourceType: 'auction' | 'service' | 'parking') => {
        if (sourceType === 'auction') return 'Completed';
        return 'completed';
    };

    const canPay = (item: HistoryItem): boolean => {
        if (!item.sourceType) return false;
        if (item.type === 'Auction' && item.status === 'Accepted') return true;
        if (item.type === 'Service' && (item.status === 'accepted' || item.status === 'in_progress')) return true;
        if (item.type === 'Parking' && (item.status === 'pending' || item.status === 'confirmed')) return true;
        return false;
    };

    const openPayment = (item: HistoryItem) => {
        if (!item.sourceType) return;
        setPaymentTarget({
            sourceType: item.sourceType,
            sourceId: item.id,
            amount: item.amount || 0,
            label: item.type === 'Parking' ? 'Parking booking' : item.type === 'Service' ? 'Service request' : 'Auction repair'
        });
    };

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        if (['completed', 'success'].includes(s)) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (['accepted', 'confirmed'].includes(s)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        if (['pending', 'active'].includes(s)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (['cancelled', 'failed', 'rejected'].includes(s)) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        if (['in_progress', 'en_route', 'arrived'].includes(s)) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Auction': return 'gavel';
            case 'Service': return 'build';
            case 'Parking': return 'local_parking';
            case 'Emergency': return 'emergency';
            default: return 'receipt';
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="px-6 pt-8 pb-4">
                <h1 className="text-2xl font-black text-text-main dark:text-white">History</h1>
                <p className="text-sm text-text-sub dark:text-gray-400">Your latest activity across services.</p>
            </div>

            <div className="px-6 space-y-3">
                {loading ? (
                    <>
                        <SkeletonHistoryItem />
                        <SkeletonHistoryItem />
                        <SkeletonHistoryItem />
                        <SkeletonHistoryItem />
                    </>
                ) : items.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">history</span>
                        <p className="text-sm text-text-sub dark:text-gray-400">No history yet.</p>
                        <p className="text-xs text-text-sub dark:text-gray-500 mt-1">Your service requests, bookings, and auctions will appear here.</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-[18px]">{getTypeIcon(item.type)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-primary uppercase tracking-wide">{item.type}</p>
                                            <p className="font-bold text-text-main dark:text-white truncate">{item.title}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${getStatusBadge(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-text-sub dark:text-gray-500">{new Date(item.date).toLocaleString()}</p>
                                        {item.amount && (
                                            <p className="text-sm font-bold text-text-main dark:text-white">LKR {item.amount.toFixed(2)}</p>
                                        )}
                                    </div>
                                    {canPay(item) && (
                                        <button
                                            onClick={() => openPayment(item)}
                                            className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-primary/90"
                                        >
                                            Pay & Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {paymentTarget && (
                <PaymentModal
                    title="Complete & Pay"
                    subtitle={`${paymentTarget.label} payment`}
                    defaultAmount={String(paymentTarget.amount || '')}
                    defaultItems={paymentTarget.label}
                    sourceType={paymentTarget.sourceType}
                    sourceId={paymentTarget.sourceId}
                    onClose={() => setPaymentTarget(null)}
                    onSuccess={async () => {
                        try {
                            const token = localStorage.getItem('token');
                            await fetch(getStatusEndpoint(paymentTarget.sourceType, paymentTarget.sourceId), {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ status: getCompletedStatus(paymentTarget.sourceType) })
                            });
                        } catch { /* status update is best-effort */ }
                        setPaymentTarget(null);
                        setToast({ message: 'Payment completed!', type: 'success' });
                        await fetchAll();
                    }}
                />
            )}

            <BottomNav />
        </div>
    );
}
