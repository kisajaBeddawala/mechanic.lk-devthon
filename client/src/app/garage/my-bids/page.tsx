"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GarageBottomNav } from '@/components/ui/GarageBottomNav';

interface BidInfo {
    auctionId: string;
    bidId: string;
    vehicle: { make: string; model: string; year: number };
    description: string;
    auctionStatus: string;
    bidAmount: number;
    estimatedTime: string;
    note?: string;
    bidCreatedAt: string;
    endsAt: string;
    isAccepted: boolean;
    driverName: string;
    driverPhone?: string;
    photos: string[];
}

export default function MyBidsPage() {
    const router = useRouter();
    const [bids, setBids] = useState<BidInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'accepted'>('all');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch('http://localhost:5000/api/auctions/my-bids', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setBids(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    const filteredBids = bids.filter(bid => {
        if (filter === 'active') return bid.auctionStatus === 'Active' && !bid.isAccepted;
        if (filter === 'accepted') return bid.isAccepted;
        return true;
    });

    const filters = [
        { key: 'all' as const, label: 'All' },
        { key: 'active' as const, label: 'Active' },
        { key: 'accepted' as const, label: 'Won' },
    ];

    return (
        <div className="relative min-h-screen w-full bg-background-light dark:bg-background-dark pb-24">
            {/* Header */}
            <div className="fixed top-0 z-30 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="rounded-full p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-white">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-text-main dark:text-white">My Bids</h1>
                        <p className="text-xs text-text-sub dark:text-gray-400 font-medium">Track your proposals</p>
                    </div>
                </div>
            </div>

            <main className="pt-24 px-4">
                {/* Filter tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === f.key
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-text-sub dark:text-gray-400'
                                }`}
                        >
                            {f.label}
                            {f.key !== 'all' && (
                                <span className="ml-1">
                                    ({bids.filter(b => f.key === 'active' ? (b.auctionStatus === 'Active' && !b.isAccepted) : b.isAccepted).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 h-36 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredBids.length === 0 ? (
                    <div className="text-center mt-20">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">gavel</span>
                        <p className="text-gray-500 font-bold">No bids found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {filter === 'all' ? 'Start bidding on repair requests!' : `No ${filter} bids.`}
                        </p>
                        <button
                            onClick={() => router.push('/garage/repairs')}
                            className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"
                        >
                            Browse Repairs
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredBids.map((bid) => (
                            <div
                                key={bid.bidId}
                                onClick={() => router.push(`/garage/repairs/${bid.auctionId}`)}
                                className="group overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-soft transition-all hover:shadow-lg active:scale-[0.99] cursor-pointer"
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-2">
                                            {bid.isAccepted ? (
                                                <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Won
                                                </span>
                                            ) : (
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${bid.auctionStatus === 'Active'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {bid.auctionStatus === 'Active' ? 'Pending' : bid.auctionStatus}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-lg font-black text-primary">LKR {bid.bidAmount.toLocaleString()}</span>
                                    </div>

                                    <h3 className="text-base font-bold text-text-main dark:text-white mb-1">
                                        {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}
                                    </h3>
                                    <p className="text-sm text-text-sub dark:text-gray-400 line-clamp-1 mb-3">
                                        {bid.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                                        <div className="flex items-center gap-3 text-xs text-text-sub dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                {bid.estimatedTime}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">person</span>
                                                {bid.driverName}
                                            </span>
                                        </div>
                                        <span className="text-xs text-text-sub dark:text-gray-400">
                                            {new Date(bid.bidCreatedAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Contact info for accepted bids */}
                                    {bid.isAccepted && bid.driverPhone && (
                                        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                                            <a href={`tel:${bid.driverPhone}`} className="flex items-center gap-2 text-primary text-sm font-bold">
                                                <span className="material-symbols-outlined text-lg">call</span>
                                                Contact Driver: {bid.driverPhone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <GarageBottomNav />
        </div>
    );
}
