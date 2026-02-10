"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

export default function DriverAuctionPage() {
    const router = useRouter();
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await fetch('http://mechaniclk-devthon-production.up.railway.app/api/auctions/driver', {
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
    }, []);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <div className="fixed top-0 z-30 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                <h1 className="text-xl font-black text-text-main dark:text-white">My Requests</h1>
                <button
                    onClick={() => router.push('/driver/auction/create')}
                    className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-glow hover:bg-primary/90 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    New
                </button>
            </div>

            <main className="pt-24 px-6 space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500 mt-10">Loading requests...</p>
                ) : auctions.length === 0 ? (
                    <div className="text-center mt-20 opacity-60">
                        <span className="material-symbols-outlined text-5xl mb-4 text-gray-300">post_add</span>
                        <p className="font-bold text-lg mb-1">No Active Requests</p>
                        <p className="text-sm">Post a repair request to get bids from mechanics.</p>
                    </div>
                ) : (
                    auctions.map((auction) => (
                        <div
                            key={auction._id}
                            onClick={() => router.push(`/driver/auction/${auction._id}`)}
                            className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.99] transition-transform"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-text-main dark:text-white text-lg">
                                    {auction.vehicle?.year} {auction.vehicle?.make} {auction.vehicle?.model}
                                </h3>
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${auction.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {auction.status === 'Active' ? 'Open' : auction.status}
                                </span>
                            </div>
                            <p className="text-sm text-text-sub dark:text-gray-400 line-clamp-2 mb-4">
                                {auction.description}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                <div className="flex items-center gap-1 text-primary">
                                    <span className="material-symbols-outlined text-lg">gavel</span>
                                    <span className="font-bold text-sm">{auction.bids?.length || 0} Bids Received</span>
                                </div>
                                <span className="text-xs text-text-sub dark:text-gray-500">
                                    Ends {new Date(auction.endsAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </main>

            <BottomNav />
        </div>
    );
}
