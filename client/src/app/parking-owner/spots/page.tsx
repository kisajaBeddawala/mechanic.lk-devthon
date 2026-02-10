"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParkingBottomNav } from '@/components/ui/ParkingBottomNav';

interface ParkingSpot {
    _id: string;
    title: string;
    description: string;
    pricePerHour: number;
    dailyMaxRate?: number;
    vehicleTypes: string[];
    features: string[];
    availability: {
        isAvailable: boolean;
        days: string[];
        startTime: string;
        endTime: string;
    };
    location: {
        address: string;
        city: string;
    };
    bookings: string[];
    createdAt: string;
}

export default function MySpotsPage() {
    const router = useRouter();
    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch('http://localhost:5000/api/parking/my-spots', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSpots(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    const handleDelete = async (spotId: string) => {
        if (!confirm('Are you sure you want to delete this parking spot? This cannot be undone.')) return;

        setDeleting(spotId);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`http://localhost:5000/api/parking/${spotId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setSpots(prev => prev.filter(s => s._id !== spotId));
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete spot');
            }
        } catch (err) {
            alert('An error occurred while deleting');
        } finally {
            setDeleting(null);
        }
    };

    const toggleAvailability = async (spotId: string, currentAvailability: boolean) => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`http://localhost:5000/api/parking/${spotId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    availability: { isAvailable: !currentAvailability }
                })
            });

            if (res.ok) {
                setSpots(prev => prev.map(s =>
                    s._id === spotId
                        ? { ...s, availability: { ...s.availability, isAvailable: !currentAvailability } }
                        : s
                ));
            }
        } catch (err) {
            console.error('Error toggling availability:', err);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-display">
            <div className="px-6 pt-8 pb-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="rounded-full p-2 -ml-2 text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-extrabold text-text-main dark:text-white">My Parking Spots</h1>
            </div>

            <div className="px-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="material-symbols-outlined text-4xl text-gray-300 animate-spin">progress_activity</span>
                        <p className="mt-4 text-sm text-text-sub">Loading spots...</p>
                    </div>
                ) : spots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">local_parking</span>
                        <p className="text-lg font-bold text-text-main dark:text-white">No spots yet</p>
                        <p className="text-sm text-text-sub dark:text-gray-400 mt-2">Add your first parking spot to start earning.</p>
                        <button onClick={() => router.push('/parking-owner/add')} className="mt-4 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-glow">
                            Add Parking Spot
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {spots.map((spot) => (
                            <div key={spot._id} className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-text-main dark:text-white leading-tight">{spot.title}</h3>
                                        <p className="text-sm text-text-sub dark:text-gray-400 mt-1 line-clamp-1">{spot.description}</p>
                                    </div>
                                    <div className={`ml-3 px-3 py-1 rounded-full text-xs font-bold uppercase ${spot.availability?.isAvailable !== false
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {spot.availability?.isAvailable !== false ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-text-sub dark:text-gray-400 mb-3">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">location_on</span>
                                        {spot.location?.city || spot.location?.address || 'No location'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">payments</span>
                                        LKR {spot.pricePerHour}/hr
                                    </span>
                                </div>

                                {spot.vehicleTypes?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {spot.vehicleTypes.map(type => (
                                            <span key={type} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-text-sub dark:text-gray-300">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {spot.features?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {spot.features.map(f => (
                                            <span key={f} className="px-2 py-1 rounded-md bg-primary/10 text-xs font-medium text-primary">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                                    <button
                                        onClick={() => toggleAvailability(spot._id, spot.availability?.isAvailable !== false)}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95 ${spot.availability?.isAvailable !== false
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                            : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            {spot.availability?.isAvailable !== false ? 'pause_circle' : 'play_circle'}
                                        </span>
                                        {spot.availability?.isAvailable !== false ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(spot._id)}
                                        disabled={deleting === spot._id}
                                        className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                        {deleting === spot._id ? '...' : 'Delete'}
                                    </button>
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
