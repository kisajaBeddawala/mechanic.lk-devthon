"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GarageBottomNav } from '@/components/ui/GarageBottomNav';

interface Bid {
    _id: string;
    bidder: { _id: string; name: string; avatarUrl?: string };
    amount: number;
    estimatedTime: string;
    note?: string;
    createdAt: string;
}

interface AuctionDetail {
    _id: string;
    user: { _id: string; name: string; avatarUrl?: string; phone?: string };
    vehicle: { make: string; model: string; year: number; drivable: boolean };
    description: string;
    status: string;
    endsAt: string;
    photos: string[];
    bids: Bid[];
    acceptedBid?: string;
    createdAt: string;
}

export default function AuctionDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [auction, setAuction] = useState<AuctionDetail | null>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [placingBid, setPlacingBid] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchAuction = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(`http://localhost:5000/api/auctions/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAuction(data);
                } else {
                    showToast('Auction not found', 'error');
                }
            } catch (error) {
                console.error("Error fetching auction", error);
                showToast('Failed to load auction', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchAuction();
    }, [params.id, router]);

    const isExpired = auction ? new Date(auction.endsAt) < new Date() : false;
    const canBid = auction?.status === 'Active' && !isExpired;

    const handleBid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canBid) {
            showToast('This auction is no longer accepting bids', 'error');
            return;
        }
        if (Number(bidAmount) <= 0) {
            showToast('Bid amount must be greater than 0', 'error');
            return;
        }
        setPlacingBid(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`http://localhost:5000/api/auctions/${params.id}/bid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(bidAmount),
                    estimatedTime: `${estimatedTime} hours`,
                    note
                })
            });

            if (res.ok) {
                showToast('Bid placed successfully!', 'success');
                setTimeout(() => router.push('/garage/my-bids'), 1500);
            } else {
                const err = await res.json();
                showToast(err.message || 'Failed to place bid', 'error');
            }
        } catch (error) {
            console.error("Error placing bid", error);
            showToast('An error occurred', 'error');
        } finally {
            setPlacingBid(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
                <div className="pt-24 px-6 space-y-4">
                    <div className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                    <div className="h-8 w-2/3 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                    <div className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                </div>
                <GarageBottomNav />
            </div>
        );
    }
    if (!auction) return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
            <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                <p className="text-text-main dark:text-white font-bold mt-2">Auction not found</p>
                <button onClick={() => router.back()} className="mt-4 text-primary font-bold">Go Back</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}

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
                                src={`http://localhost:5000${photo}`}
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
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary/10 text-primary'}`}>
                                {isExpired ? 'Expired' : auction.status}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-text-sub dark:text-gray-300 rounded-lg text-xs font-bold">
                                Ends {new Date(auction.endsAt).toLocaleDateString()}
                            </span>
                            {!auction.vehicle?.drivable && (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-xs font-bold">
                                    Not Drivable
                                </span>
                            )}
                        </div>

                        {/* Driver Info */}
                        {auction.user && (
                            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-400">person</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-main dark:text-white">{auction.user.name}</p>
                                    {auction.user.phone && (
                                        <p className="text-xs text-text-sub dark:text-gray-400">{auction.user.phone}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-text-main dark:text-white mb-2 uppercase tracking-wide opacity-70">Description</h3>
                            <p className="text-base text-text-sub dark:text-gray-300 leading-relaxed">
                                {auction.description}
                            </p>
                        </div>
                    </div>

                    {/* Existing Bids */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-text-main dark:text-white mb-3 uppercase tracking-wide opacity-70">
                            Bids ({auction.bids?.length || 0})
                        </h3>
                        {auction.bids && auction.bids.length > 0 ? (
                            <div className="space-y-3">
                                {auction.bids.map((bid, idx) => (
                                    <div key={bid._id || idx} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-sm">person</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-main dark:text-white">{typeof bid.bidder === 'object' ? bid.bidder.name : 'Bidder'}</p>
                                                <p className="text-xs text-text-sub dark:text-gray-400">{bid.estimatedTime}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-primary">LKR {bid.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-sub dark:text-gray-400">No bids yet. Be the first!</p>
                        )}
                    </div>
                </div>

                {/* Bid Form */}
                {canBid ? (
                    <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-glow border border-gray-100 dark:border-gray-800 mb-6">
                        <h3 className="text-xl font-black text-text-main dark:text-white mb-6">Place Your Bid</h3>
                        <form onSubmit={handleBid} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-sub dark:text-gray-400">Bid Amount (LKR)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 5000"
                                    min="1"
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
                                    min="1"
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
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 text-center mb-6">
                        <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">block</span>
                        <p className="text-sm font-bold text-text-sub dark:text-gray-400">
                            {isExpired ? 'This auction has expired' : `This auction is ${auction.status.toLowerCase()}`}
                        </p>
                    </div>
                )}
            </main>
            <GarageBottomNav />
        </div>
    );
}
