"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AuctionDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [auction, setAuction] = useState<any>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [placingBid, setPlacingBid] = useState(false);

    useEffect(() => {
        const fetchAuction = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(`https://mechaniclk-devthon-production.up.railway.app/api/auctions/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAuction(data);
                } else {
                    console.error("Auction not found");
                }
            } catch (error) {
                console.error("Error fetching auction", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuction();
    }, [params.id, router]);

    const handleBid = async (e: React.FormEvent) => {
        e.preventDefault();
        setPlacingBid(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`https://mechaniclk-devthon-production.up.railway.app/api/auctions/${params.id}/bid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(bidAmount),
                    estimatedTime: Number(estimatedTime),
                    note
                })
            });

            if (res.ok) {
                alert('Bid placed successfully!');
                router.push('/garage/auctions');
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error("Error placing bid", error);
        } finally {
            setPlacingBid(false);
        }
    };

    if (loading) return <div className="p-6 text-center text-text-main dark:text-white">Loading...</div>;
    if (!auction) return <div className="p-6 text-center text-text-main dark:text-white">Auction not found</div>;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-10">
            {/* Header */}
            <div className="fixed top-0 z-30 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <button onClick={() => router.back()} className="rounded-full p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white">Job Details</h1>
            </div>

            <main className="pt-24 px-6">
                {/* Images */}
                <div className="mb-6 flex gap-3 overflow-x-auto pb-2 snap-x">
                    {auction.photos && auction.photos.length > 0 ? (
                        auction.photos.map((photo: string, index: number) => (
                            <img
                                key={index}
                                src={`https://mechaniclk-devthon-production.up.railway.app${photo}`}
                                alt="Issue"
                                className="h-48 w-full min-w-[280px] max-w-sm flex-shrink-0 snap-center rounded-2xl object-cover shadow-sm bg-gray-100 dark:bg-gray-800"
                            />
                        ))
                    ) : (
                        <div className="h-48 w-full rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-text-main dark:text-white mb-2">
                            {auction.vehicle?.year} {auction.vehicle?.make} {auction.vehicle?.model}
                        </h2>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase tracking-wider">
                                {auction.status}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-text-sub dark:text-gray-300 rounded-lg text-xs font-bold">
                                Ends {new Date(auction.endsAt).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-text-main dark:text-white mb-2 uppercase tracking-wide opacity-70">Description</h3>
                            <p className="text-base text-text-sub dark:text-gray-300 leading-relaxed">
                                {auction.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bid Form */}
                <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-glow border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-black text-text-main dark:text-white mb-6">Place Your Bid</h3>
                    <form onSubmit={handleBid} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-sub dark:text-gray-400">Bid Amount ($)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                className="w-full rounded-xl border-0 bg-gray-50 dark:bg-gray-800 p-4 text-lg font-bold text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-sub dark:text-gray-400">Est. Time (Hours)</label>
                            <input
                                type="number"
                                placeholder="e.g. 2"
                                value={estimatedTime}
                                onChange={(e) => setEstimatedTime(e.target.value)}
                                className="w-full rounded-xl border-0 bg-gray-50 dark:bg-gray-800 p-4 text-lg font-bold text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-sub dark:text-gray-400">Note to Driver</label>
                            <textarea
                                placeholder="I can fix this by..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full rounded-xl border-0 bg-gray-50 dark:bg-gray-800 p-4 text-base font-medium text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all placeholder:text-gray-400"
                                rows={3}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={placingBid}
                            className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-glow hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 mt-2"
                        >
                            {placingBid ? 'Submitting...' : 'Submit Proposal'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
