"use client";

import { usePathname, useRouter } from 'next/navigation';

export function GarageBottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { icon: 'home', label: 'Home', path: '/garage/dashboard' },
        { icon: 'gavel', label: 'Repairs', path: '/garage/repairs' },
        { icon: 'add', label: '', path: '/garage/add', isMain: true },
        { icon: 'receipt_long', label: 'My Bids', path: '/garage/my-bids' },
        { icon: 'person', label: 'Profile', path: '/garage/profile' },
    ];

    const isActive = (path: string) => {
        if (path === '/garage/dashboard') return pathname === path;
        return pathname === path || pathname.startsWith(path + '/') ||
            (path === '/garage/repairs' && pathname.startsWith('/garage/auctions'));
    };

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#21242c]/95 backdrop-blur-lg pb-safe">
            <div className="flex items-center justify-around px-6 py-3">
                {navItems.map((item) => {
                    if (item.isMain) {
                        return (
                            <div key={item.path} className="relative -top-5">
                                <button
                                    onClick={() => router.push(item.path)}
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-glow hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-[#21242c]"
                                >
                                    <span className="material-symbols-outlined text-[32px]">
                                        {item.icon}
                                    </span>
                                </button>
                            </div>
                        );
                    }

                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`flex flex-col items-center gap-1.5 transition-colors group ${active
                                ? 'text-primary dark:text-white'
                                : 'text-text-sub hover:text-primary dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[26px] transition-transform ${active ? 'font-bold' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            {item.label && (
                                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="h-4 w-full"></div>
        </div>
    );
}
