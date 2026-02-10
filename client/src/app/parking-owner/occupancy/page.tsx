"use client";

import { ParkingBottomNav } from '@/components/ui/ParkingBottomNav';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SpotData {
    _id: string;
    title: string;
    availability: { isAvailable: boolean };
    bookings: string[];
}

export default function OccupancyPage() {
    const router = useRouter();
    const [spots, setSpots] = useState<SpotData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOccupancy = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/parking/my-spots', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setSpots(data);
            }
        } catch (err) {
            console.error('Error fetching occupancy:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOccupancy();
        // Poll every 30 seconds for live updates
        const interval = setInterval(fetchOccupancy, 30000);
        return () => clearInterval(interval);
    }, []);

    const availableCount = spots.filter(s => s.availability?.isAvailable !== false).length;
    const occupiedCount = spots.filter(s => s.availability?.isAvailable === false).length;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <div className="fixed top-0 z-30 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="rounded-full p-1 text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-black text-text-main dark:text-white">Live Status</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-green-500 uppercase">Live</span>
                </div>
            </div>

            <main className="pt-20 px-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="material-symbols-outlined text-4xl text-gray-300 animate-spin">progress_activity</span>
                        <p className="mt-4 text-sm text-text-sub">Loading spots...</p>
                    </div>
                ) : spots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">local_parking</span>
                        <p className="text-lg font-bold text-text-main dark:text-white">No spots listed yet</p>
                        <p className="text-sm text-text-sub dark:text-gray-400 mt-2">Add a parking spot to see live occupancy.</p>
                        <button onClick={() => router.push('/parking-owner/add')} className="mt-4 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-glow">
                            Add Spot
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-center">
                                <p className="text-3xl font-black text-green-600">{availableCount}</p>
                                <p className="text-xs font-bold text-green-600 uppercase mt-1">Available</p>
                            </div>
                            <div className="flex-1 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-center">
                                <p className="text-3xl font-black text-red-500">{occupiedCount}</p>
                                <p className="text-xs font-bold text-red-500 uppercase mt-1">Occupied</p>
                            </div>
                            <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-center">
                                <p className="text-3xl font-black text-blue-600">{spots.length}</p>
                                <p className="text-xs font-bold text-blue-600 uppercase mt-1">Total</p>
                            </div>
                        </div>

                        {/* Spots Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {spots.map((spot, i) => {
                                const isAvailable = spot.availability?.isAvailable !== false;
                                const activeBookings = spot.bookings?.length || 0;

                                return (
                                    <div
                                        key={spot._id}
                                        className={`rounded-2xl p-4 border-2 transition-all ${isAvailable
                                                ? 'border-green-500/20 bg-green-50 dark:bg-green-900/10'
                                                : 'border-red-500/20 bg-red-50 dark:bg-red-900/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-lg font-black text-text-main dark:text-white truncate pr-2">{spot.title || `Spot ${i + 1}`}</span>
                                            {!isAvailable && <span className="material-symbols-outlined text-red-500">directions_car</span>}
                                        </div>
                                        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                                            {isAvailable ? 'available' : 'occupied'}
                                        </div>
                                        <div className="text-sm font-medium text-text-sub dark:text-gray-400">
                                            {activeBookings} booking{activeBookings !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </main>

            <ParkingBottomNav />
        </div>
    );
}
