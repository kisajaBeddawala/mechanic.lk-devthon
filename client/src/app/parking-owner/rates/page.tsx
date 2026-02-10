"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ParkingBottomNav } from '@/components/ui/ParkingBottomNav';

export default function ManageRatesPage() {
    const router = useRouter();
    const [spots, setSpots] = React.useState<any[]>([]);
    const [selectedSpotId, setSelectedSpotId] = React.useState('');
    const [rates, setRates] = React.useState({
        pricePerHour: 0,
        dailyMaxRate: 0,
        isPeakPricingActive: false
    });
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        const fetchSpots = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/parking/my-spots', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSpots(data);
                    if (data.length > 0) {
                        setSelectedSpotId(data[0]._id);
                        setRates({
                            pricePerHour: data[0].pricePerHour || 0,
                            dailyMaxRate: data[0].dailyMaxRate || 0,
                            isPeakPricingActive: data[0].isPeakPricingActive || false
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching spots", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSpots();
    }, [router]);

    const handleSpotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const spotId = e.target.value;
        setSelectedSpotId(spotId);
        const spot = spots.find(s => s._id === spotId);
        if (spot) {
            setRates({
                pricePerHour: spot.pricePerHour || 0,
                dailyMaxRate: spot.dailyMaxRate || 0,
                isPeakPricingActive: spot.isPeakPricingActive || false
            });
        }
    };

    const updateRate = (field: 'pricePerHour' | 'dailyMaxRate', delta: number) => {
        setRates(prev => ({
            ...prev,
            [field]: Math.max(0, prev[field] + delta)
        }));
    };

    const handleSave = async () => {
        if (!selectedSpotId) return;
        setSaving(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`https://mechaniclk-devthon-production.up.railway.app/api/parking/${selectedSpotId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(rates)
            });

            if (res.ok) {
                // Update local spots state to reflect saved changes
                setSpots(prev => prev.map(s => s._id === selectedSpotId ? { ...s, ...rates } : s));
                alert('Rates updated successfully!');
            } else {
                alert('Failed to update rates');
            }
        } catch (error) {
            console.error("Error updating rates", error);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6 text-center text-text-main dark:text-white">Loading spots...</div>;

    if (spots.length === 0) {
        return (
            <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark text-text-main dark:text-white">
                <p className="mb-4 text-lg">You haven't added any parking spots yet.</p>
                <button
                    onClick={() => router.push('/parking-owner/add')}
                    className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-glow hover:bg-primary/90"
                >
                    Add Parking Spot
                </button>
                <div className="absolute bottom-0 w-full">
                    <ParkingBottomNav />
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-display transition-colors duration-200 antialiased">
            <div className="px-6 pt-8 pb-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="rounded-full p-2 -ml-2 text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-extrabold text-text-main dark:text-white">Manage Rates</h1>
            </div>

            <div className="px-6 pb-6">
                <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-3 ml-1">Select Location</label>
                <div className="relative group">
                    <select
                        value={selectedSpotId}
                        onChange={handleSpotChange}
                        className="w-full appearance-none rounded-2xl bg-white dark:bg-card-dark px-5 py-4 text-base font-bold text-text-main dark:text-white shadow-soft outline-none ring-1 ring-transparent focus:ring-primary transition-all cursor-pointer"
                    >
                        {spots.map(spot => (
                            <option key={spot._id} value={spot._id}>{spot.title}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-primary">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
            </div>

            <div className="px-6 mb-4">
                <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white">Hourly Rate</h2>
                            <p className="text-sm font-medium text-text-sub dark:text-gray-400">Base price per hour</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-background-light dark:bg-background-dark p-2">
                        <button
                            onClick={() => updateRate('pricePerHour', -50)}
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-card-dark shadow-sm text-text-sub hover:text-primary active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-text-sub align-top mt-1">$</span>
                            <input
                                className="w-24 bg-transparent text-center text-4xl font-extrabold text-text-main dark:text-white focus:outline-none p-0 border-none"
                                type="number"
                                value={rates.pricePerHour}
                                onChange={(e) => setRates({ ...rates, pricePerHour: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <button
                            onClick={() => updateRate('pricePerHour', 50)}
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-glow text-white active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 mb-4">
                <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white">Daily Max Rate</h2>
                            <p className="text-sm font-medium text-text-sub dark:text-gray-400">Maximum charge per 24h</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">calendar_today</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-background-light dark:bg-background-dark p-2">
                        <button
                            onClick={() => updateRate('dailyMaxRate', -100)}
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-card-dark shadow-sm text-text-sub hover:text-primary active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-text-sub align-top mt-1">LKR</span>
                            <input
                                className="w-24 bg-transparent text-center text-4xl font-extrabold text-text-main dark:text-white focus:outline-none p-0 border-none"
                                type="number"
                                value={rates.dailyMaxRate}
                                onChange={(e) => setRates({ ...rates, dailyMaxRate: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <button
                            onClick={() => updateRate('dailyMaxRate', 100)}
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-glow text-white active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 mb-8">
                <div
                    onClick={() => setRates({ ...rates, isPeakPricingActive: !rates.isPeakPricingActive })}
                    className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft flex items-center justify-between cursor-pointer group"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                            <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-text-main dark:text-white">Peak Pricing</h2>
                            <p className="text-xs font-medium text-text-sub dark:text-gray-400">Increase rates during high demand</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                        <input
                            className="sr-only peer"
                            type="checkbox"
                            checked={rates.isPeakPricingActive}
                            readOnly
                        />
                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>

            <div className="px-6 mt-auto">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full rounded-2xl bg-primary py-4 text-center font-bold text-white shadow-glow transition-transform active:scale-[0.98] text-lg hover:brightness-110 disabled:opacity-70"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <ParkingBottomNav />
        </div>
    );
}
