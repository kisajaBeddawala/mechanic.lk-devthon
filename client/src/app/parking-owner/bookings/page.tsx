"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParkingBottomNav } from '@/components/ui/ParkingBottomNav';

interface Booking {
    _id: string;
    user: { _id: string; name: string; email: string; phone?: string };
    parkingSpot: { _id: string; title: string };
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: string;
}

export default function BookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch('http://localhost:5000/api/bookings/owner', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setBookings(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    const updateStatus = async (bookingId: string, newStatus: string) => {
        setUpdating(bookingId);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/owner-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updated = await res.json();
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: updated.status } : b));
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update');
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setUpdating(null);
        }
    };

    const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        completed: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-LK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-display">
            <div className="px-6 pt-8 pb-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="rounded-full p-2 -ml-2 text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-extrabold text-text-main dark:text-white">Bookings</h1>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 pb-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all ${filter === f
                                ? 'bg-primary text-white shadow-glow'
                                : 'bg-white dark:bg-card-dark text-text-sub dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700'
                                }`}
                        >
                            {f} {f !== 'all' && `(${bookings.filter(b => b.status === f).length})`}
                            {f === 'all' && ` (${bookings.length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="material-symbols-outlined text-4xl text-gray-300 animate-spin">progress_activity</span>
                        <p className="mt-4 text-sm text-text-sub">Loading bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">event_busy</span>
                        <p className="text-lg font-bold text-text-main dark:text-white">No bookings found</p>
                        <p className="text-sm text-text-sub dark:text-gray-400 mt-2">
                            {filter !== 'all' ? `No ${filter} bookings. Try another filter.` : 'Bookings from drivers will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredBookings.map((booking) => (
                            <div key={booking._id} className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-text-main dark:text-white">
                                            {booking.parkingSpot?.title || 'Parking Spot'}
                                        </h3>
                                        <p className="text-sm text-text-sub dark:text-gray-400 mt-0.5">
                                            Booked by: {booking.user?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[booking.status]}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                    <div className="flex items-center gap-2 text-text-sub dark:text-gray-400">
                                        <span className="material-symbols-outlined text-base">schedule</span>
                                        <span>{formatDate(booking.startTime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-text-sub dark:text-gray-400">
                                        <span className="material-symbols-outlined text-base">schedule</span>
                                        <span>{formatDate(booking.endTime)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                                    <span className="text-xl font-black text-primary">LKR {booking.totalPrice}</span>

                                    {booking.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateStatus(booking._id, 'confirmed')}
                                                disabled={updating === booking._id}
                                                className="flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-sm">check</span>
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => updateStatus(booking._id, 'cancelled')}
                                                disabled={updating === booking._id}
                                                className="flex items-center gap-1 rounded-xl bg-red-100 px-4 py-2 text-xs font-bold text-red-700 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {booking.status === 'confirmed' && (
                                        <button
                                            onClick={() => updateStatus(booking._id, 'completed')}
                                            disabled={updating === booking._id}
                                            className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-sm">done_all</span>
                                            Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ParkingBottomNav />
        </div>
    );
}
