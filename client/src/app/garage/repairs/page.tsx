"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

export default function GarageAuctionFeedPage() {
    const router = useRouter();
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/auctions/garage', {
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

    return (
        <div className="relative min-h-screen w-full bg-background-light dark:bg-background-dark pb-24">
            <div className="fixed top-0 z-30 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 shadow-sm">
                <h1 className="text-xl font-black text-text-main dark:text-white">Repair Jobs</h1>
                <p className="text-xs text-text-sub dark:text-gray-400 font-medium">Bid on active requests</p>
            </div>

            <main className="pt-24 px-4">
                {loading ? (
                    <p className="text-center text-gray-500 mt-10">Loading opportunities...</p>
                ) : auctions.length === 0 ? (
                    <div className="text-center mt-20">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span>
                        <p className="text-gray-500">No active repair requests found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {auctions.map((auction) => (
                            <div
                                key={auction._id}
                                onClick={() => router.push(`/garage/auctions/${auction._id}`)}
                                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-soft transition-all hover:shadow-lg active:scale-[0.99] cursor-pointer border border-transparent hover:border-primary/20"
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${auction.status === 'Open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {auction.status}
                                        </span>
                                        <span className="text-xs font-medium text-text-sub dark:text-gray-400">
                                            Ends: {new Date(auction.endsAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">
                                        {auction.vehicle?.year} {auction.vehicle?.make} {auction.vehicle?.model}
                                    </h3>

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

            <BottomNav />
        </div>
    );
}
