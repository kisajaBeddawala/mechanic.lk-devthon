"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParkingBottomNav } from '@/components/ui/ParkingBottomNav';

interface DashboardStats {
    totalSpots: number;
    occupiedSpots: number;
    revenue: number;
    occupancyRate: number;
    totalBookings: number;
    pendingBookings: number;
}

export default function ParkingDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string; image?: string } | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }

        fetch('http://localhost:5000/api/parking/stats', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

    }, [router]);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark pb-24 font-display">
            {/* Header */}
            <div className="pt-8 px-6 pb-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-md overflow-hidden">
                                {user?.image ? (
                                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${user.image}")` }}></div>
                                ) : (
                                    <span className="material-symbols-outlined text-primary text-3xl">person</span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-background-dark"></div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-text-main dark:text-white">
                                Hello, {user?.name || 'User'}
                            </h1>
                            <div className="mt-1 flex items-start">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-primary dark:bg-primary/20 dark:text-primary-300">
                                    Parking Owner
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="relative rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="px-6 py-2">
                <div className="grid grid-cols-4 gap-4">
                    <button onClick={() => router.push('/parking-owner/spots')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">My Spots</span>
                    </button>
                    <button onClick={() => router.push('/parking-owner/bookings')} className="flex flex-col items-center gap-2 group">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
                            {stats && stats.pendingBookings > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {stats.pendingBookings}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Bookings</span>
                    </button>
                    <button onClick={() => router.push('/parking-owner/occupancy')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">monitoring</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Live</span>
                    </button>
                    <button onClick={() => router.push('/parking-owner/profile')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">settings</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Settings</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-6 pt-6 pb-3">
                <h3 className="text-text-main dark:text-white tracking-tight text-xl font-bold leading-tight">Stats Overview</h3>
            </div>

            <div className="px-6 grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600 text-lg">local_parking</span>
                        </div>
                        <span className="text-xs font-bold text-text-sub dark:text-gray-400 uppercase">Total Spots</span>
                    </div>
                    <p className="text-3xl font-black text-text-main dark:text-white">
                        {loading ? '...' : (stats?.totalSpots || 0)}
                    </p>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 text-lg">directions_car</span>
                        </div>
                        <span className="text-xs font-bold text-text-sub dark:text-gray-400 uppercase">Occupied</span>
                    </div>
                    <p className="text-3xl font-black text-text-main dark:text-white">
                        {loading ? '...' : (stats?.occupiedSpots || 0)}
                    </p>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-600 text-lg">payments</span>
                        </div>
                        <span className="text-xs font-bold text-text-sub dark:text-gray-400 uppercase">Revenue</span>
                    </div>
                    <p className="text-3xl font-black text-text-main dark:text-white">
                        {loading ? '...' : `LKR ${stats?.revenue || 0}`}
                    </p>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-600 text-lg">pending_actions</span>
                        </div>
                        <span className="text-xs font-bold text-text-sub dark:text-gray-400 uppercase">Bookings</span>
                    </div>
                    <p className="text-3xl font-black text-text-main dark:text-white">
                        {loading ? '...' : (stats?.totalBookings || 0)}
                    </p>
                </div>
            </div>

            <div className="px-6 pt-6 pb-3">
                <h3 className="text-text-main dark:text-white tracking-tight text-xl font-bold leading-tight">Quick Actions</h3>
            </div>

            <div className="flex flex-col gap-4 px-6">
                {/* Live Occupancy */}
                <button onClick={() => router.push('/parking-owner/occupancy')} className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-1 shadow-soft transition-all hover:shadow-lg active:scale-[0.99]">
                    <div className="flex h-full flex-grow items-center gap-4 p-4 pr-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[32px]">timelapse</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <p className="text-lg font-bold leading-tight text-text-main dark:text-white">Live Occupancy</p>
                            <p className="text-sm font-medium leading-normal text-text-sub dark:text-gray-400">
                                {stats ? `${stats.occupiedSpots || 0} / ${stats.totalSpots || 0} spots occupied` : 'Monitor current parked cars'}
                            </p>
                        </div>
                    </div>
                    <div className="pr-5 text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                </button>

                {/* Manage Bookings */}
                <button onClick={() => router.push('/parking-owner/bookings')} className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-1 shadow-soft transition-all hover:shadow-lg active:scale-[0.99]">
                    <div className="flex h-full flex-grow items-center gap-4 p-4 pr-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[32px]">event_note</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <p className="text-lg font-bold leading-tight text-text-main dark:text-white">Manage Bookings</p>
                            <p className="text-sm font-medium leading-normal text-text-sub dark:text-gray-400">
                                {stats && stats.pendingBookings > 0 ? `${stats.pendingBookings} pending` : 'View & confirm reservations'}
                            </p>
                        </div>
                    </div>
                    <div className="pr-5 text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                </button>

                {/* Manage Rates */}
                <button onClick={() => router.push('/parking-owner/rates')} className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-1 shadow-soft transition-all hover:shadow-lg active:scale-[0.99]">
                    <div className="flex h-full flex-grow items-center gap-4 p-4 pr-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[32px]">price_change</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <p className="text-lg font-bold leading-tight text-text-main dark:text-white">Manage Rates</p>
                            <p className="text-sm font-medium leading-normal text-text-sub dark:text-gray-400">Update hourly/daily pricing</p>
                        </div>
                    </div>
                    <div className="pr-5 text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                </button>

                {/* Add New Spot */}
                <button onClick={() => router.push('/parking-owner/add')} className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-1 shadow-soft transition-all hover:shadow-lg active:scale-[0.99]">
                    <div className="flex h-full flex-grow items-center gap-4 p-4 pr-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[32px]">add_location_alt</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <p className="text-lg font-bold leading-tight text-text-main dark:text-white">Add New Spot</p>
                            <p className="text-sm font-medium leading-normal text-text-sub dark:text-gray-400">List a new parking space</p>
                        </div>
                    </div>
                    <div className="pr-5 text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                </button>
            </div>

            <div className="h-8 w-full"></div>

            <ParkingBottomNav />
        </div>
    );
}
