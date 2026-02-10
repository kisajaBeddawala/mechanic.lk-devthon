"use client";

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: string;
    plate: string;
}

interface EmergencyRequest {
    _id: string;
    status: string;
    issueDescription: string;
    createdAt: string;
}

export default function EmergencyPage() {
    const [issueDescription, setIssueDescription] = useState('');
    const [vehicleDetails, setVehicleDetails] = useState({ make: '', model: '', year: '', plateNumber: '' });
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [request, setRequest] = useState<EmergencyRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchMyRequests = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/emergency/my', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            setRequest(data[0]);
        }
    };

    useEffect(() => {
        fetchMyRequests();
        const interval = setInterval(fetchMyRequests, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('driverVehicles');
        if (stored) {
            setVehicles(JSON.parse(stored));
        }
    }, []);

    const applyVehicle = (vehicle: Vehicle | null) => {
        if (!vehicle) return;
        setVehicleDetails({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            plateNumber: vehicle.plate
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        if (!issueDescription.trim()) {
            setError('Please describe the issue.');
            setLoading(false);
            return;
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/emergency', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        location: {
                            type: 'Point',
                            coordinates: [position.coords.longitude, position.coords.latitude]
                        },
                        vehicleDetails: {
                            make: vehicleDetails.make,
                            model: vehicleDetails.model,
                            year: vehicleDetails.year ? Number(vehicleDetails.year) : undefined,
                            plateNumber: vehicleDetails.plateNumber
                        },
                        issueDescription
                    })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to send request');
                }
                setRequest(data);
                setIssueDescription('');
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        }, () => {
            setError('Unable to get your location.');
            setLoading(false);
        });
    };

    const handleCancel = async () => {
        if (!request) return;
        const token = localStorage.getItem('token');
        await fetch(`https://mechaniclk-devthon-production.up.railway.app/api/emergency/${request._id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'cancelled' })
        });
        fetchMyRequests();
    };

    return (
        <div className="min-h-screen bg-red-50 dark:bg-red-950/20 pb-24 flex flex-col p-6">
            <div className="flex flex-col items-center text-center">
                <div className="h-32 w-32 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500 mb-6 animate-pulse">
                    <span className="material-symbols-outlined text-6xl">sos</span>
                </div>

                <h1 className="text-3xl font-black text-text-main dark:text-white mb-2">Emergency Help</h1>
                <p className="text-text-sub dark:text-gray-400 mb-6 max-w-xs">
                    Quickly connect with nearby mechanics or emergency services.
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-xl bg-red-100 text-red-600 p-3 text-sm font-bold">{error}</div>
            )}

            <button className="w-full rounded-2xl bg-red-600 py-5 text-xl font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all mb-4">
                Call 119
            </button>

            <div className="rounded-2xl bg-white dark:bg-card-dark p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-text-main dark:text-white mb-3">Request a Mechanic</h2>
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
                    <input
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                        placeholder="Plate"
                        value={vehicleDetails.plateNumber}
                        onChange={(e) => setVehicleDetails({ ...vehicleDetails, plateNumber: e.target.value })}
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
                    onClick={handleSubmit}
                    disabled={loading}
                    className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                >
                    {loading ? 'Sending request...' : 'Find Nearest Mechanic'}
                </button>
            </div>

            {request && (
                <div className="mt-6 rounded-2xl bg-white dark:bg-card-dark p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">Current Request</h3>
                    <p className="text-sm text-text-sub dark:text-gray-400 mb-2">{request.issueDescription}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-primary">{request.status}</span>
                        <span className="text-xs text-text-sub dark:text-gray-500">{new Date(request.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {request.status !== 'completed' && request.status !== 'cancelled' && (
                        <button
                            onClick={handleCancel}
                            className="mt-3 w-full rounded-xl bg-red-500 py-2 text-xs font-bold text-white"
                        >
                            Cancel Request
                        </button>
                    )}
                </div>
            )}

            <BottomNav />
        </div>
    );
}
