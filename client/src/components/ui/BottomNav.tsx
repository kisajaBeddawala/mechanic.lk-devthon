"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        // We can check role from local storage or infer from path
        // Checking path is faster for immediate rendering
        if (pathname.startsWith('/garage')) {
            setRole('garage');
        } else if (pathname.startsWith('/driver')) {
            setRole('driver');
        } else if (pathname.startsWith('/parking-owner')) {
            setRole('parking-owner');
        }
    }, [pathname]);

    interface NavItem {
        icon: string;
        label: string;
        path: string;
        isMain?: boolean;
    }

    const driverNavItems: NavItem[] = [
        { icon: 'home', label: 'Home', path: '/driver/dashboard' },
        { icon: 'car_repair', label: 'Mechanic', path: '/driver/services' },
        { icon: 'gavel', label: 'Auctions', path: '/driver/auction' },
        { icon: 'local_parking', label: 'Parking', path: '/driver/parking' },
        { icon: 'person', label: 'Profile', path: '/driver/profile' },
    ];

    const garageNavItems: NavItem[] = [
        { icon: 'home', label: 'Home', path: '/garage/dashboard' },
        { icon: 'gavel', label: 'Repairs', path: '/garage/repairs' },
        { icon: 'add', label: '', path: '/garage/add', isMain: true },
        { icon: 'receipt_long', label: 'My Bids', path: '/garage/my-bids' },
        { icon: 'person', label: 'Profile', path: '/garage/profile' },
    ];

    const parkingNavItems: NavItem[] = [
        { icon: 'home', label: 'Home', path: '/parking-owner/dashboard' },
        { icon: 'receipt_long', label: 'Bookings', path: '/parking-owner/bookings' },
        { icon: 'add', label: 'Add', path: '/parking-owner/add', isMain: true },
        { icon: 'currency_exchange', label: 'Rates', path: '/parking-owner/rates' },
        { icon: 'person', label: 'Profile', path: '/parking-owner/profile' },
    ];

    // Decide which items to show
    let navItems: NavItem[] = driverNavItems;
    if (role === 'garage') navItems = garageNavItems;
    if (role === 'parking-owner') navItems = parkingNavItems;

    // Only show on relevant pages
    if (!role) return null;

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#21242c]/95 backdrop-blur-lg pb-safe">
            <div className={`flex items-center justify-between px-6 py-3 ${role === 'garage' || role === 'parking-owner' ? 'justify-around' : ''}`}>
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== (role === 'garage' ? '/garage/dashboard' : role === 'parking-owner' ? '/parking-owner/dashboard' : '/driver/dashboard') && pathname.startsWith(item.path));

                    // Special rendering for the "Main" button (Plus button)
                    if (item.isMain) {
                        return (
                            <div key={item.path} className="relative -top-5">
                                <button
                                    onClick={() => router.push(item.path)}
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-glow hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[32px]">
                                        {item.icon}
                                    </span>
                                </button>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`flex flex-col items-center gap-1.5 transition-colors group ${isActive
                                ? 'text-primary dark:text-white'
                                : 'text-text-sub hover:text-primary dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[26px] transition-transform ${isActive ? 'font-bold' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            {item.label && (
                                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </div>
            {/* Add extra padding at bottom if needed, but 'pb-safe' usually handles it. 
                For the floating button, we might need a bit more space to avoid overlap if content scrolls behind.
             */}
            <div className="h-5 w-full"></div>
        </div>
    );
}
