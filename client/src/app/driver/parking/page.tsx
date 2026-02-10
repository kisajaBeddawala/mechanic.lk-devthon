"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BottomNav } from '@/components/ui/BottomNav';
import { ParkingCard } from '@/components/features/ParkingCard';
import { Toast } from '@/components/ui/Toast';
import { SkeletonCard } from '@/components/ui/Skeleton';

const Map = dynamic(() => import('@/components/ui/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
}

export default function ParkingPage() {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [spots, setSpots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpot, setSelectedSpot] = useState<any | null>(null);
    const [hours, setHours] = useState('1');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => {
                    setUserLocation([6.9271, 79.8612]);
                }
            );
        } else {
            setUserLocation([6.9271, 79.8612]);
        }
    }, []);

    useEffect(() => {
        const fetchSpots = async () => {
            try {
                let url = 'https://mechaniclk-devthon-production.up.railway.app/api/parking/nearby';
                if (userLocation) {
                    url += `?lat=${userLocation[0]}&long=${userLocation[1]}&radius=10`;
                }
                const res = await fetch(url);
                const data = await res.json();

                if (data.data && Array.isArray(data.data)) {
                    setSpots(data.data);
                } else if (Array.isArray(data)) {
                    setSpots(data);
                } else {
                    setSpots([]);
                }
            } catch {
                setSpots([]);
            } finally {
                setLoading(false);
            }
        };

        if (userLocation) {
            fetchSpots();
        }
    }, [userLocation]);

    const getDistance = (spot: any): string => {
        if (!userLocation || !spot.location?.coordinates) return 'N/A';
        return calcDistance(
            userLocation[0], userLocation[1],
            spot.location.coordinates[1], spot.location.coordinates[0]
        );
    };

    const filteredSpots = spots.filter((spot) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            spot.title?.toLowerCase().includes(q) ||
            spot.description?.toLowerCase().includes(q) ||
            spot.vehicleTypes?.some((v: string) => v.toLowerCase().includes(q))
        );
    });

    const mapMarkers = filteredSpots.map(spot => ({
        id: spot._id,
        position: [spot.location.coordinates[1], spot.location.coordinates[0]] as [number, number],
        title: spot.title,
        description: `LKR ${spot.pricePerHour}/hr`,
        type: 'parking' as const
    }));

    const handleOpenBooking = (spot: any) => {
        setSelectedSpot(spot);
        setHours('1');
        setBookingError('');
    };

    const handleCreateBooking = async () => {
        if (!selectedSpot?._id) return;
        setBookingLoading(true);
        setBookingError('');

        try {
            const token = localStorage.getItem('token');
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + Number(hours) * 60 * 60 * 1000);

            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/bookings/parking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    parkingSpot: selectedSpot._id,
                    startTime,
                    endTime
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to reserve');
            }
            setSelectedSpot(null);
            setToast({ message: 'Parking spot reserved successfully!', type: 'success' });
        } catch (err: any) {
            setBookingError(err.message || 'Something went wrong');
        } finally {
            setBookingLoading(false);
        }
    };

    const totalCost = selectedSpot ? (Number(hours) * selectedSpot.pricePerHour) : 0;

    return (
        <div className="relative h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden flex flex-col">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="absolute top-0 z-20 w-full px-6 pt-6 pb-2 bg-gradient-to-b from-background-light/90 to-transparent dark:from-background-dark/90 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-white dark:bg-card-dark rounded-full shadow-soft flex items-center p-1 pr-4 border border-gray-100 dark:border-gray-800">
                        <span className="material-symbols-outlined text-gray-400 ml-3 mr-2">search</span>
                        <input
                            type="text"
                            placeholder="Find parking..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-text-main dark:text-white placeholder:text-text-sub outline-none"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Toggle View */}
                <div className="pointer-events-auto flex p-1 bg-white/80 dark:bg-card-dark/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 w-fit mx-auto">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-md' : 'text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                    >
                        Map
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                    >
                        List
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative mt-[130px]">
                {/* Map View */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    {userLocation && (
                        <Map
                            center={userLocation}
                            markers={mapMarkers}
                            height="100%"
                        />
                    )}
                </div>

                {/* List View */}
                <div className={`absolute inset-0 overflow-y-auto px-6 pb-32 transition-opacity duration-300 ${viewMode === 'list' ? 'opacity-100 z-10 bg-background-light dark:bg-background-dark' : 'opacity-0 z-0 pointer-events-none'}`}>
                    {loading ? (
                        <div className="grid gap-4 pt-2">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    ) : filteredSpots.length === 0 ? (
                        <div className="text-center mt-20 opacity-60">
                            <span className="material-symbols-outlined text-4xl mb-2">location_off</span>
                            <p>{searchQuery ? 'No parking spots match your search.' : 'No parking spots found nearby.'}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 pt-2">
                            {filteredSpots.map(spot => (
                                <ParkingCard
                                    key={spot._id}
                                    title={spot.title}
                                    description={spot.description}
                                    pricePerHour={spot.pricePerHour}
                                    distance={getDistance(spot)}
                                    vehicleTypes={spot.vehicleTypes}
                                    onBook={() => handleOpenBooking(spot)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedSpot && (
                <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-card-dark p-5 shadow-xl">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-text-main dark:text-white">Reserve Spot</h3>
                                <p className="text-sm text-text-sub dark:text-gray-400">{selectedSpot.title}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSpot(null)}
                                className="rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {bookingError && (
                            <div className="mb-3 rounded-xl bg-red-100 text-red-600 p-2 text-xs font-bold">{bookingError}</div>
                        )}

                        <div className="flex items-center gap-3 mb-3">
                            <label className="text-sm font-bold text-text-main dark:text-white">Hours</label>
                            <input
                                type="number"
                                min="1"
                                className="w-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                            />
                            <span className="text-sm text-text-sub dark:text-gray-400 ml-auto">
                                Total: <span className="font-bold text-primary">LKR {totalCost.toFixed(2)}</span>
                            </span>
                        </div>
                        <button
                            onClick={handleCreateBooking}
                            disabled={bookingLoading}
                            className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                        >
                            {bookingLoading ? 'Reserving...' : 'Reserve Now'}
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
