"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BottomNav } from '@/components/ui/BottomNav';
import { ServiceCard } from '@/components/features/ServiceCard';

// Dynamically import Map
const Map = dynamic(() => import('@/components/ui/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function ServicesPage() {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [mechanics, setMechanics] = useState<any[]>([]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMechanic, setSelectedMechanic] = useState<any | null>(null);
    const [issueDescription, setIssueDescription] = useState('');
    const [vehicleDetails, setVehicleDetails] = useState({ make: '', model: '', year: '' });
    const [vehicles, setVehicles] = useState<{ id: string; make: string; model: string; year: string; plate: string }[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        // Get Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setUserLocation([6.9271, 79.8612]); // Fallback Colombo
                }
            );
        } else {
            setUserLocation([6.9271, 79.8612]);
        }
    }, []);

    useEffect(() => {
        const fetchMechanics = async () => {
            try {
                let url = 'https://mechaniclk-devthon-production.up.railway.app/api/mechanics';
                if (userLocation) {
                    url += `?lat=${userLocation[0]}&lng=${userLocation[1]}&radius=20`;
                }
                const res = await fetch(url);
                const data = await res.json();

                if (data.data && Array.isArray(data.data)) {
                    setMechanics(data.data);
                } else if (Array.isArray(data)) {
                    setMechanics(data);
                } else {
                    setMechanics([]);
                }
            } catch (error) {
                console.error("Error fetching mechanics", error);
            } finally {
                setLoading(false);
            }
        };

        if (userLocation) {
            fetchMechanics();
        }
    }, [userLocation]);

    useEffect(() => {
        const stored = localStorage.getItem('driverVehicles');
        if (stored) {
            setVehicles(JSON.parse(stored));
        }
    }, []);

    const applyVehicle = (vehicle: { make: string; model: string; year: string } | null) => {
        if (!vehicle) return;
        setVehicleDetails({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year
        });
    };

    const mapMarkers = mechanics.map(mech => ({
        id: mech._id,
        position: [mech.location.coordinates[1], mech.location.coordinates[0]] as [number, number],
        title: mech.businessName,
        description: mech.description,
        type: 'mechanic' as const
    }));

    const handleOpenRequest = (mechanic: any) => {
        setSelectedMechanic(mechanic);
        setIssueDescription('');
        setVehicleDetails({ make: '', model: '', year: '' });
        setSelectedVehicleId('');
        setRequestError('');
    };

    const handleCreateRequest = async () => {
        if (!selectedMechanic?.user?._id) {
            setRequestError('Mechanic info not available.');
            return;
        }

        if (!issueDescription.trim()) {
            setRequestError('Please describe the issue.');
            return;
        }

        setRequestLoading(true);
        setRequestError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/service-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    mechanicUser: selectedMechanic.user._id,
                    vehicleDetails: {
                        make: vehicleDetails.make,
                        model: vehicleDetails.model,
                        year: vehicleDetails.year ? Number(vehicleDetails.year) : undefined
                    },
                    issueDescription,
                    location: userLocation ? { type: 'Point', coordinates: [userLocation[1], userLocation[0]] } : undefined
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to create request');
            }
            setSelectedMechanic(null);
        } catch (err: any) {
            setRequestError(err.message || 'Something went wrong');
        } finally {
            setRequestLoading(false);
        }
    };

    return (
        <div className="relative h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden flex flex-col">
            {/* Header */}
            <div className="absolute top-0 z-20 w-full px-6 pt-6 pb-2 bg-gradient-to-b from-background-light/90 to-transparent dark:from-background-dark/90 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-white dark:bg-card-dark rounded-full shadow-soft flex items-center p-1 pr-4 border border-gray-100 dark:border-gray-800">
                        <span className="material-symbols-outlined text-gray-400 ml-3 mr-2">search</span>
                        <input
                            type="text"
                            placeholder="Find mechanics, garages..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-text-main dark:text-white placeholder:text-text-sub"
                        />
                    </div>
                    <button className="h-10 w-10 rounded-full bg-white dark:bg-card-dark shadow-soft flex items-center justify-center text-text-main dark:text-white border border-gray-100 dark:border-gray-800">
                        <span className="material-symbols-outlined">tune</span>
                    </button>
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
                <div className={`absolute inset-0 overflow-y-auto px-6 pb-24 transition-opacity duration-300 ${viewMode === 'list' ? 'opacity-100 z-10 bg-background-light dark:bg-background-dark' : 'opacity-0 z-0 pointer-events-none'}`}>
                    {loading ? (
                        <p className="text-center text-gray-500 mt-10">Scanning area...</p>
                    ) : mechanics.length === 0 ? (
                        <div className="text-center mt-20 opacity-60">
                            <span className="material-symbols-outlined text-4xl mb-2 sm:text-5xl">location_off</span>
                            <p>No mechanics found nearby.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 pt-2">
                            {mechanics.map((mech) => (
                                <ServiceCard
                                    key={mech._id}
                                    title={mech.businessName}
                                    providerName={mech.user?.name || 'Mechanic'}
                                    price={mech.services?.[0]?.price || 0} // Display first service price or 0
                                    rating={mech.rating || 4.8} // Use rating or default
                                    timeEstimate={mech.services?.[0]?.estimatedTime ? `${mech.services[0].estimatedTime} mins` : '15 mins'}
                                    distance="2.5km" // Placeholder for now
                                    tags={mech.services?.map((s: any) => s.name).slice(0, 3)}
                                    onBook={() => handleOpenRequest(mech)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedMechanic && (
                <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-card-dark p-5 shadow-xl">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-text-main dark:text-white">Request Service</h3>
                                <p className="text-sm text-text-sub dark:text-gray-400">{selectedMechanic.businessName}</p>
                            </div>
                            <button
                                onClick={() => setSelectedMechanic(null)}
                                className="rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {requestError && (
                            <div className="mb-3 rounded-xl bg-red-100 text-red-600 p-2 text-xs font-bold">{requestError}</div>
                        )}

                        <div className="mb-3">
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-2">Saved Vehicle</label>
                            <select
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                value={selectedVehicleId}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedVehicleId(value);
                                    const selected = vehicles.find((v) => v.id === value) || null;
                                    applyVehicle(selected);
                                }}
                            >
                                <option value="">Choose from garage (optional)</option>
                                {vehicles.map((vehicle) => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                placeholder="Make"
                                value={vehicleDetails.make}
                                onChange={(e) => setVehicleDetails({ ...vehicleDetails, make: e.target.value })}
                            />
                            <input
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                placeholder="Model"
                                value={vehicleDetails.model}
                                onChange={(e) => setVehicleDetails({ ...vehicleDetails, model: e.target.value })}
                            />
                            <input
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                placeholder="Year"
                                value={vehicleDetails.year}
                                onChange={(e) => setVehicleDetails({ ...vehicleDetails, year: e.target.value })}
                            />
                        </div>
                        <textarea
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            rows={3}
                            placeholder="Describe the issue"
                            value={issueDescription}
                            onChange={(e) => setIssueDescription(e.target.value)}
                        />
                        <button
                            onClick={handleCreateRequest}
                            disabled={requestLoading}
                            className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                        >
                            {requestLoading ? 'Sending request...' : 'Send Request'}
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
