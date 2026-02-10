"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

export default function DriverDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string; email: string; avatarUrl?: string } | null>(null);

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
    }, [router]);

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-display transition-colors duration-200 antialiased min-h-screen flex flex-col pb-24">
            {/* Header Section */}
            <div className="pt-8 px-6 pb-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-white dark:border-gray-700 shadow-md flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                                {user?.avatarUrl && user.avatarUrl !== 'default-avatar.jpg' ? (
                                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-text-main dark:text-white">
                                Hello, {user?.name || 'User'}
                            </h1>
                            <div className="mt-1 flex items-start">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-primary dark:bg-primary/20 dark:text-primary-300">
                                    Driver
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => router.push('/driver/history')} className="relative rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="px-6 py-2">
                <div className="grid grid-cols-4 gap-4">
                    <button onClick={() => router.push('/driver/garage')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">garage</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Garage</span>
                    </button>
                    <button onClick={() => router.push('/driver/history')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">history</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">History</span>
                    </button>
                    <button onClick={() => router.push('/driver/wallet')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">account_balance_wallet</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Wallet</span>
                    </button>
                    <button onClick={() => router.push('/driver/settings')} className="flex flex-col items-center gap-2 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-card-dark shadow-sm ring-1 ring-slate-900/5 transition-all group-active:scale-95 group-active:bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-[24px]">settings</span>
                        </div>
                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">Settings</span>
                    </button>
                </div>
            </div>

            {/* Services Section */}
            <div className="px-6 pt-6 pb-3">
                <h3 className="text-text-main dark:text-white tracking-tight text-xl font-bold leading-tight">Services</h3>
            </div>
            <div className="flex flex-col gap-4 px-6">
                <button onClick={() => router.push('/driver/services')} className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-1 shadow-soft transition-all hover:shadow-lg active:scale-[0.99]">
                    <div className="flex h-full flex-grow items-center gap-4 p-4 pr-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[32px]">car_repair</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <p className="text-lg font-bold leading-tight text-text-main dark:text-white">Find a Mechanic</p>
                            <p className="text-sm font-medium leading-normal text-text-sub dark:text-gray-400">Roadside help & repair shops</p>
                        </div>
                    </div>
                    <div className="pr-5 text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                </button>
                <button onClick={() => router.push('/driver/auction')} className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-1 shadow-soft transition-all hover:shadow-lg active:scale-[0.99]">
                    <div className="flex h-full flex-grow items-center gap-4 p-4 pr-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[32px]">gavel</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <p className="text-lg font-bold leading-tight text-text-main dark:text-white">Auction-Repair</p>
                            <p className="text-sm font-medium leading-normal text-text-sub dark:text-gray-400">Bid on repair services</p>
                        </div>
                    </div>
                    <div className="pr-5 text-gray-300 dark:text-gray-600">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                </button>
                <button onClick={() => router.push('/driver/parking')} className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white dark:bg-card-dark p-1 shadow-soft transition-all hover:shadow-lg active:scale-[0.99]">
                    <div className="flex h-full flex-grow items-center gap-4 p-4 pr-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[32px]">local_parking</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <p className="text-lg font-bold leading-tight text-text-main dark:text-white">Parking</p>
                            <p className="text-sm font-medium leading-normal text-text-sub dark:text-gray-400">Find spots nearby</p>
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
