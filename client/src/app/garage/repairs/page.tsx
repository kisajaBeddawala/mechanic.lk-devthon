"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GarageBottomNav } from '@/components/ui/GarageBottomNav';

interface Auction {
    _id: string;
    vehicle: { make: string; model: string; year: number; drivable: boolean };
    description: string;
    status: string;
    endsAt: string;
    bids: { _id: string; bidder: string; amount: number }[];
    photos: string[];
    createdAt: string;
}

export default function GarageAuctionFeedPage() {
    const router = useRouter();
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('http://localhost:5000/api/auctions/garage', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setAuctions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching auctions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuctions();
    }, [router]);

    const isExpired = (endsAt: string) => new Date(endsAt) < new Date();

    return (
        <div className="relative min-h-screen w-full bg-background-light dark:bg-background-dark pb-24">
            <div className="fixed top-0 z-30 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 shadow-sm">
                <h1 className="text-xl font-black text-text-main dark:text-white">Repair Jobs</h1>
                <p className="text-xs text-text-sub dark:text-gray-400 font-medium">Bid on active requests from drivers</p>
            </div>

            <main className="pt-24 px-4">
                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 h-40 animate-pulse"></div>
                        ))}
                    </div>
                ) : auctions.length === 0 ? (
                    <div className="text-center mt-20">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span>
                        <p className="text-gray-500 font-bold">No active repair requests found.</p>
                        <p className="text-sm text-gray-400 mt-1">Check back later for new driver requests.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {auctions.map((auction) => (
                            <div
                                key={auction._id}
                                onClick={() => router.push(`/garage/repairs/${auction._id}`)}
                                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-soft transition-all hover:shadow-lg active:scale-[0.99] cursor-pointer border border-transparent hover:border-primary/20"
                            >
                                {/* Photo thumbnail */}
                                {auction.photos && auction.photos.length > 0 && (
                                    <div className="h-32 w-full overflow-hidden">
                                        <img
                                            src={`http://localhost:5000${auction.photos[0]}`}
                                            alt="Vehicle issue"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${isExpired(auction.endsAt)
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            : auction.status === 'Active'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {isExpired(auction.endsAt) ? 'Expired' : auction.status}
                                        </span>
                                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">
                                            Ends: {new Date(auction.endsAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">
                                        {auction.vehicle?.year} {auction.vehicle?.make} {auction.vehicle?.model}
                                    </h3>
                                    {!auction.vehicle?.drivable && (
                                        <span className="inline-block mb-2 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            Not Drivable
                                        </span>
                                    )}

                                    <p className="text-sm text-text-sub dark:text-gray-400 line-clamp-2 mb-4">
                                        {auction.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
                                        <div className="flex items-center gap-1 text-primary">
                                            <span className="material-symbols-outlined text-lg">gavel</span>
                                            <span className="font-bold text-sm">{auction.bids?.length || 0} Bids</span>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </div>
                                    </div>
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
