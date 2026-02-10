"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

export default function ParkingDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string; image?: string } | null>(null);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        fetch('http://mechaniclk-devthon-production.up.railway.app/api/parking/stats', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));

    }, [router]);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark pb-24 font-display">
            {/* Header */}
            <div className="pt-8 px-6 pb-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-md"
                                style={{ backgroundImage: `url("${user?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyCKmyWKr7ViSy9-Eda6RQtk68Sy5bB7-E_8m3EHE4s2I0259V41ouausLUBuDMZyIIJJMasfgQWftjNIB7GbN5hME-tz3aAv1lONZsZ7HUEaqd8wxdfp3q0kvHKlXX2X7zATP6tr_2sW3yK_C-1I8qMQmHw6H8ji07e2pDltuvIQUJLaJ24_c3NkEGVtDKwzGWTcLOW3P9g_MHsWdzSlmSEoJN39VdNAmcIbz_x1MRTt5r-KdL0GM6B7MASGF1GogPdTXj4qTLr0'}")` }}>
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
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
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
                    <button onClick={() => router.push('/parking-owner/revenue')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Revenue</span>
                    </button>
                    <button onClick={() => router.push('/parking-owner/analytics')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">monitoring</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Analytics</span>
                    </button>
                    <button onClick={() => router.push('/parking-owner/support')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">support_agent</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Support</span>
                    </button>
                </div>
            </div>

            <div className="px-6 pt-6 pb-3">
                <h3 className="text-text-main dark:text-white tracking-tight text-xl font-bold leading-tight">Overview</h3>
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

            <BottomNav />
        </div>
    );
}
