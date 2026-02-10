"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

interface AuctionBid {
    _id: string;
    bidder: { name: string };
    amount: number;
    estimatedTime: string;
    note?: string;
    createdAt: string;
}

interface AuctionDetail {
    _id: string;
    vehicle: { make: string; model: string; year: number; drivable: boolean };
    description: string;
    photos: string[];
    status: string;
    endsAt: string;
    bids: AuctionBid[];
    acceptedBid?: string;
}

interface PaymentMethod {
    _id: string;
    label: string;
    customerToken: string;
}

export default function DriverAuctionDetailPage() {
    const router = useRouter();
    const params = useParams();
    const auctionId = params?.id as string;
    const [auction, setAuction] = useState<AuctionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMode, setPaymentMode] = useState<'payhere' | 'cash'>('payhere');
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentItems, setPaymentItems] = useState('Auction repair');
    const [paymentError, setPaymentError] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
    const [zoom, setZoom] = useState(1);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [mouseStartX, setMouseStartX] = useState<number | null>(null);

    useEffect(() => {
        const fetchAuction = async () => {
            const token = localStorage.getItem('token');
            if (!token || !auctionId) return;

            try {
                const res = await fetch(`https://mechaniclk-devthon-production.up.railway.app/api/auctions/${auctionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to load auction');
                }
                setAuction(data);
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchAuction();
    }, [auctionId]);

    useEffect(() => {
        if (activePhotoIndex === null) return;

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') goNext();
            if (event.key === 'ArrowLeft') goPrev();
            if (event.key === 'Escape') setActivePhotoIndex(null);
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [activePhotoIndex]);

    const handleAcceptBid = async (bidId: string) => {
        if (!auctionId) return;
        setAcceptingId(bidId);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://mechaniclk-devthon-production.up.railway.app/api/auctions/${auctionId}/accept-bid`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ bidId })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to accept bid');
            }
            setAuction(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setAcceptingId(null);
        }
    };

    const fetchMethods = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/methods', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
            setMethods(data);
        }
    };

    const getAcceptedBidAmount = () => {
        if (!auction?.acceptedBid) return null;
        const bid = auction.bids.find((b) => b._id === auction.acceptedBid);
        return bid ? bid.amount : null;
    };

    const openPayment = () => {
        const defaultAmount = getAcceptedBidAmount();
        if (defaultAmount) {
            setPaymentAmount(String(defaultAmount));
        }
        setPaymentItems('Auction repair');
        setPaymentMode('payhere');
        setPaymentError('');
        setShowPayment(true);
        fetchMethods();
    };

    const handleCompleteWithPayment = async () => {
        if (!auctionId) return;
        if (!paymentAmount) {
            setPaymentError('Amount is required.');
            return;
        }

        setPaymentLoading(true);
        setPaymentError('');

        try {
            const token = localStorage.getItem('token');
            if (paymentMode === 'payhere') {
                if (!selectedMethodId) {
                    setPaymentError('Please select a payment method.');
                    setPaymentLoading(false);
                    return;
                }

                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/charge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        paymentMethodId: selectedMethodId,
                        amount: Number(paymentAmount),
                        currency: 'LKR',
                        items: paymentItems || 'Auction repair',
                        sourceType: 'auction',
                        sourceId: auctionId
                    })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || data.gateway?.msg || 'Charge failed');
                }
            } else {
                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/payments/cash', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        amount: Number(paymentAmount),
                        currency: 'LKR',
                        items: paymentItems || 'Auction repair',
                        sourceType: 'auction',
                        sourceId: auctionId
                    })
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to record cash payment');
                }
            }

            await handleStatusUpdate('Completed');
            setShowPayment(false);
        } catch (err: any) {
            setPaymentError(err.message || 'Something went wrong');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        if (!auctionId) return;
        setStatusLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://mechaniclk-devthon-production.up.railway.app/api/auctions/${auctionId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to update status');
            }
            setAuction(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setStatusLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">Loading...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">
                <p className="text-red-500 font-bold">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 rounded-xl bg-primary px-4 py-2 text-white font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!auction) return null;

    const photoUrls = (auction.photos || []).map((photo) => {
        const normalized = photo.replace(/\\/g, '/');
        const uploadsIndex = normalized.toLowerCase().lastIndexOf('/uploads/');
        const relativePath = uploadsIndex >= 0
            ? normalized.slice(uploadsIndex)
            : normalized.startsWith('/')
                ? normalized
                : `/uploads/${normalized.split('/').pop()}`;
        return normalized.startsWith('http')
            ? normalized
            : `https://mechaniclk-devthon-production.up.railway.app${relativePath}`;
    });

    const goNext = () => {
        if (activePhotoIndex === null || photoUrls.length === 0) return;
        setActivePhotoIndex((activePhotoIndex + 1) % photoUrls.length);
        setZoom(1);
    };

    const goPrev = () => {
        if (activePhotoIndex === null || photoUrls.length === 0) return;
        setActivePhotoIndex((activePhotoIndex - 1 + photoUrls.length) % photoUrls.length);
        setZoom(1);
    };

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        setTouchStartX(event.touches[0]?.clientX ?? null);
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX === null) return;
        const endX = event.changedTouches[0]?.clientX ?? touchStartX;
        const delta = endX - touchStartX;
        if (delta > 50) goPrev();
        if (delta < -50) goNext();
        setTouchStartX(null);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        setMouseStartX(event.clientX);
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        if (mouseStartX === null) return;
        const delta = event.clientX - mouseStartX;
        if (delta > 80) goPrev();
        if (delta < -80) goNext();
        setMouseStartX(null);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <div className="sticky top-0 z-30 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-black text-text-main dark:text-white">Auction Details</h1>
            </div>

            <main className="px-6 py-6 space-y-6">
                <section className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-text-main dark:text-white">
                                {auction.vehicle.year} {auction.vehicle.make} {auction.vehicle.model}
                            </h2>
                            <p className="text-sm text-text-sub dark:text-gray-400 mt-1">
                                {auction.vehicle.drivable ? 'Drivable' : 'Not drivable'}
                            </p>
                        </div>
                        <span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {auction.status === 'Active' ? 'Open' : auction.status}
                        </span>
                    </div>

                    <p className="text-sm text-text-sub dark:text-gray-400 mt-4">{auction.description}</p>

                    {photoUrls.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {photoUrls.map((photoUrl, index) => {
                                return (
                                    <img
                                        key={index}
                                        src={photoUrl}
                                        alt="Auction photo"
                                        className="h-28 w-full rounded-xl object-cover cursor-zoom-in"
                                        loading="lazy"
                                        onClick={() => {
                                            setActivePhotoIndex(index);
                                            setZoom(1);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <p className="mt-4 text-xs text-text-sub dark:text-gray-500">No photos uploaded.</p>
                    )}

                    <p className="mt-4 text-xs text-text-sub dark:text-gray-500">
                        Ends {new Date(auction.endsAt).toLocaleDateString()}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {auction.status === 'Active' && (
                            <button
                                onClick={() => handleStatusUpdate('Cancelled')}
                                disabled={statusLoading}
                                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-600 disabled:opacity-60"
                            >
                                {statusLoading ? 'Closing...' : 'Close Auction'}
                            </button>
                        )}
                        {auction.status === 'Accepted' && (
                            <button
                                onClick={openPayment}
                                disabled={statusLoading}
                                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                            >
                                {statusLoading ? 'Updating...' : 'Complete & Pay'}
                            </button>
                        )}
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-text-main dark:text-white">Bids</h3>
                        <span className="text-xs text-text-sub dark:text-gray-500">{auction.bids.length} total</span>
                    </div>

                    {auction.bids.length === 0 ? (
                        <div className="text-center text-sm text-text-sub dark:text-gray-400 py-6">No bids yet.</div>
                    ) : (
                        auction.bids.map((bid) => {
                            const isAccepted = auction.acceptedBid === bid._id;
                            return (
                                <div key={bid._id} className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold text-text-main dark:text-white">{bid.bidder?.name || 'Mechanic'}</p>
                                            <p className="text-xs text-text-sub dark:text-gray-400">{bid.estimatedTime}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-primary">${bid.amount}</p>
                                            <p className="text-xs text-text-sub dark:text-gray-400">{new Date(bid.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {bid.note && (
                                        <p className="text-sm text-text-sub dark:text-gray-400 mt-3">{bid.note}</p>
                                    )}

                                    <div className="mt-4">
                                        {isAccepted ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                Accepted
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleAcceptBid(bid._id)}
                                                disabled={auction.status !== 'Active' || !!acceptingId}
                                                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {acceptingId === bid._id ? 'Accepting...' : 'Accept Bid'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>
            </main>

            <BottomNav />

            {activePhotoIndex !== null && photoUrls[activePhotoIndex] && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-6"
                    onClick={() => setActivePhotoIndex(null)}
                >
                    <div
                        className="relative max-h-full max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                    >
                        <button
                            onClick={() => setActivePhotoIndex(null)}
                            className="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-700"
                        >
                            Close
                        </button>
                        <div className="absolute -top-10 left-0 flex items-center gap-2">
                            <button
                                onClick={() => setZoom((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))))}
                                className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-700"
                            >
                                -
                            </button>
                            <button
                                onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))))}
                                className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-700"
                            >
                                +
                            </button>
                            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-700">
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>
                        <button
                            onClick={goPrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button
                            onClick={goNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                        <img
                            src={photoUrls[activePhotoIndex]}
                            alt="Auction photo"
                            className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-xl transition-transform"
                            style={{ transform: `scale(${zoom})` }}
                        />
                    </div>
                </div>
            )}

            {showPayment && (
                <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-card-dark p-5 shadow-xl">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-text-main dark:text-white">Complete & Pay</h3>
                                <p className="text-sm text-text-sub dark:text-gray-400">Auction payment</p>
                            </div>
                            <button
                                onClick={() => setShowPayment(false)}
                                className="rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {paymentError && (
                            <div className="mb-3 rounded-xl bg-red-100 text-red-600 p-2 text-xs font-bold">{paymentError}</div>
                        )}

                        <div className="mb-3 flex items-center gap-3">
                            <label className="text-xs font-bold uppercase tracking-wide text-text-sub">Mode</label>
                            <button
                                onClick={() => setPaymentMode('payhere')}
                                className={`rounded-full px-3 py-1 text-xs font-bold ${paymentMode === 'payhere' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                PayHere
                            </button>
                            <button
                                onClick={() => setPaymentMode('cash')}
                                className={`rounded-full px-3 py-1 text-xs font-bold ${paymentMode === 'cash' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                Cash
                            </button>
                        </div>

                        {paymentMode === 'payhere' && (
                            <div className="mb-3">
                                <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-2">Payment Method</label>
                                <select
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                    value={selectedMethodId}
                                    onChange={(e) => setSelectedMethodId(e.target.value)}
                                >
                                    <option value="">Select token</option>
                                    {methods.map((method) => (
                                        <option key={method._id} value={method._id}>
                                            {method.label} (ending {method.customerToken.slice(-6)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                placeholder="Amount (LKR)"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                            />
                            <input
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                placeholder="Items"
                                value={paymentItems}
                                onChange={(e) => setPaymentItems(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleCompleteWithPayment}
                            disabled={paymentLoading}
                            className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                        >
                            {paymentLoading ? 'Processing...' : paymentMode === 'cash' ? 'Record Cash & Complete' : 'Pay & Complete'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
