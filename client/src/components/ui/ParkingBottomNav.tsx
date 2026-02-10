"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ParkingBottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 z-40 w-full border-t border-gray-100 bg-white/95 px-6 pb-6 pt-3 backdrop-blur-md dark:border-gray-800 dark:bg-background-dark/95">
            <div className="flex items-center justify-between">
                <Link
                    href="/parking-owner/dashboard"
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/parking-owner/dashboard') ? 'text-primary' : 'text-text-sub hover:text-primary dark:text-gray-400'}`}
                >
                    <span className={`material-symbols-outlined text-2xl ${isActive('/parking-owner/dashboard') ? 'font-variation-filled' : ''}`}>
                        dashboard
                    </span>
                    <span className="text-[10px] font-bold">Home</span>
                </Link>

                <Link
                    href="/parking-owner/occupancy"
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/parking-owner/occupancy') ? 'text-primary' : 'text-text-sub hover:text-primary dark:text-gray-400'}`}
                >
                    <span className={`material-symbols-outlined text-2xl ${isActive('/parking-owner/occupancy') ? 'font-variation-filled' : ''}`}>
                        monitor_heart
                    </span>
                    <span className="text-[10px] font-bold">Live</span>
                </Link>

                <Link href="/parking-owner/add">
                    <div className="flex -mt-8 h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-glow transition-transform active:scale-95 hover:scale-105">
                        <span className="material-symbols-outlined text-2xl">add</span>
                    </div>
                </Link>

                <Link
                    href="/parking-owner/rates"
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/parking-owner/rates') ? 'text-primary' : 'text-text-sub hover:text-primary dark:text-gray-400'}`}
                >
                    <span className={`material-symbols-outlined text-2xl ${isActive('/parking-owner/rates') ? 'font-variation-filled' : ''}`}>
                        currency_exchange
                    </span>
                    <span className="text-[10px] font-bold">Rates</span>
                </Link>

                <Link
                    href="/parking-owner/profile"
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/parking-owner/profile') ? 'text-primary' : 'text-text-sub hover:text-primary dark:text-gray-400'}`}
                >
                    <span className={`material-symbols-outlined text-2xl ${isActive('/parking-owner/profile') ? 'font-variation-filled' : ''}`}>
                        person
                    </span>
                    <span className="text-[10px] font-bold">Profile</span>
                </Link>
            </div>
        </div>
    );
}
