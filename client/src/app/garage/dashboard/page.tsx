"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GarageBottomNav } from '@/components/ui/GarageBottomNav';

interface MechanicProfile {
    _id: string;
    businessName: string;
    isOnline: boolean;
    rating: number;
    ratingCount: number;
    services: { name: string; price: number; category: string }[];
    images: string[];
}

interface DashboardStats {
    totalBids: number;
    acceptedBids: number;
    activeBids: number;
    isOnline: boolean;
}

export default function GarageDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
    const [mechanic, setMechanic] = useState<MechanicProfile | null>(null);
    const [stats, setStats] = useState<DashboardStats>({ totalBids: 0, acceptedBids: 0, activeBids: 0, isOnline: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                fetch('https://mechaniclk-devthon-production.up.railway.app/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        setUser(data);
                        localStorage.setItem('user', JSON.stringify(data));
                    })
                    .catch(err => console.error(err));
            }
        }

        // Fetch user profile
        fetch('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
            })
            .catch(err => console.error(err));

        // Fetch mechanic profile
        fetch('http://localhost:5000/api/mechanics/my-profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setMechanic(data);
            })
            .catch(err => console.error(err));

        // Fetch garage dashboard stats
        fetch('http://localhost:5000/api/auctions/my-bids/stats', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setStats(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    const toggleOnline = async () => {
        const token = localStorage.getItem('token');
        if (!token || !mechanic) return;
        try {
            const res = await fetch('http://localhost:5000/api/mechanics/toggle-online', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMechanic(prev => prev ? { ...prev, isOnline: data.isOnline } : null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-display transition-colors duration-200 antialiased min-h-screen flex flex-col pb-24">
            {/* Header Section */}
            <div className="pt-8 px-6 pb-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-md overflow-hidden">
                                <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                            </div>
                            <button
                                onClick={toggleOnline}
                                className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-background-dark transition-colors ${mechanic?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                                title={mechanic?.isOnline ? 'Online — tap to go offline' : 'Offline — tap to go online'}
                            ></button>
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-text-main dark:text-white">
                                Hello, {user?.name || 'Garage'}
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-primary dark:bg-primary/20 dark:text-primary-300">
                                    {user?.role || 'Garage Owner'}
                                </span>
                                {mechanic && (
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${mechanic.isOnline ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {mechanic.isOnline ? 'Online' : 'Offline'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="px-6 py-2">
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="px-6 py-2">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-sm text-center">
                            <p className="text-2xl font-black text-primary">{stats.totalBids}</p>
                            <p className="text-[11px] font-bold text-text-sub dark:text-gray-400 mt-1">Total Bids</p>
                        </div>
                        <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-sm text-center">
                            <p className="text-2xl font-black text-green-600">{stats.acceptedBids}</p>
                            <p className="text-[11px] font-bold text-text-sub dark:text-gray-400 mt-1">Won</p>
                        </div>
                        <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-sm text-center">
                            <p className="text-2xl font-black text-amber-500">{stats.activeBids}</p>
                            <p className="text-[11px] font-bold text-text-sub dark:text-gray-400 mt-1">Active</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions Grid */}
            <div className="px-6 py-4">
                <div className="grid grid-cols-4 gap-4">
                    <button onClick={() => router.push('/garage/my-bids')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">gavel</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">My Bids</span>
                    </button>
                    <button onClick={() => router.push('/garage/repairs')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">handyman</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Repairs</span>
                    </button>
                    <button onClick={() => router.push('/garage/add')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">add_business</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">My Garage</span>
                    </button>
                    <button onClick={() => router.push('/garage/profile')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">settings</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Settings</span>
                    </button>
                </div>
            </div>

            {/* Business Info Card */}
            {mechanic && (
                <div className="px-6 pb-3">
                    <div className="rounded-2xl bg-white dark:bg-card-dark p-5 shadow-soft">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-text-main dark:text-white">{mechanic.businessName}</h3>
                            {mechanic.ratingCount > 0 && (
                                <div className="flex items-center gap-1 text-amber-500">
                                    <span className="material-symbols-outlined text-lg">star</span>
                                    <span className="text-sm font-bold">{mechanic.rating.toFixed(1)}</span>
                                    <span className="text-xs text-text-sub dark:text-gray-400">({mechanic.ratingCount})</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-text-sub dark:text-gray-400">{mechanic.services.length} services listed</p>
                    </div>
                </div>
            )}

            {/* Services Section */}
            <div className="px-6 pt-4 pb-3">
                <h3 className="text-text-main dark:text-white tracking-tight text-xl font-bold leading-tight">Quick Actions</h3>
            </div>
            <div className="flex flex-col gap-4 px-6">
                <button onClick={() => router.push('/garage/repairs')} className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-1 shadow-soft transition-all hover:shadow-lg active:scale-[0.99]">
                    <div className="flex h-full flex-grow items-center gap-4 p-4 pr-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[32px]">handyman</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <p className="text-lg font-bold leading-tight text-text-main dark:text-white">Bid on Repairs</p>
                            <p className="text-sm font-medium leading-normal text-text-sub dark:text-gray-400">Find new repair jobs nearby</p>
                        </div>
                    </div>
                    <div className="pr-5 text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                </button>
                <button onClick={() => router.push('/garage/add')} className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-1 shadow-soft transition-all hover:shadow-lg active:scale-[0.99]">
                    <div className="flex h-full flex-grow items-center gap-4 p-4 pr-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[32px]">add_location_alt</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <p className="text-lg font-bold leading-tight text-text-main dark:text-white">Manage Garage</p>
                            <p className="text-sm font-medium leading-normal text-text-sub dark:text-gray-400">Update your garage profile & services</p>
                        </div>
                    </div>
                    <div className="pr-5 text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                </button>
            </div>
            <div className="h-8 w-full"></div>

            <GarageBottomNav />
        </div>
    );
}
