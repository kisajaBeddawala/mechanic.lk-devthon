"use client";

import { useEffect, useState, useCallback } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { VehicleSelector } from '@/components/features/VehicleSelector';
import { Toast } from '@/components/ui/Toast';

interface EmergencyRequest {
    _id: string;
    status: string;
    issueDescription: string;
    createdAt: string;
}

export default function EmergencyPage() {
    const [issueDescription, setIssueDescription] = useState('');
    const [vehicleDetails, setVehicleDetails] = useState({ make: '', model: '', year: '', plate: '' });
    const [request, setRequest] = useState<EmergencyRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchMyRequests = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/emergency/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                const active = data.find((r: EmergencyRequest) => r.status !== 'completed' && r.status !== 'cancelled');
                setRequest(active || null);
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchMyRequests();
        const interval = setInterval(fetchMyRequests, 10000);
        return () => clearInterval(interval);
    }, [fetchMyRequests]);

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
                            plateNumber: vehicleDetails.plate
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
                setToast({ message: 'Emergency request sent! A mechanic will be notified.', type: 'success' });
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        }, () => {
            setError('Unable to get your location. Please enable location services.');
            setLoading(false);
        });
    };

    const handleCancel = async () => {
        if (!request) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`https://mechaniclk-devthon-production.up.railway.app/api/emergency/${request._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'cancelled' })
            });
            setToast({ message: 'Request cancelled', type: 'success' });
            setRequest(null);
            fetchMyRequests();
        } catch {
            setToast({ message: 'Failed to cancel request', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-red-50 dark:bg-red-950/20 pb-24 flex flex-col p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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

            <a
                href="tel:119"
                className="w-full rounded-2xl bg-red-600 py-5 text-xl font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all mb-4 text-center block"
            >
                Call 119
            </a>

            <div className="rounded-2xl bg-white dark:bg-card-dark p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-text-main dark:text-white mb-3">Request a Mechanic</h2>

                <VehicleSelector
                    showPlate={true}
                    onVehicleChange={(details) => setVehicleDetails({ ...details, plate: details.plate || '' })}
                />

                <textarea
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm mt-3"
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
                        <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                            request.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            request.status === 'en_route' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            request.status === 'arrived' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>{request.status.replace('_', ' ')}</span>
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
