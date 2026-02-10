"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GarageBottomNav } from '@/components/ui/GarageBottomNav';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl?: string;
}

interface MechanicProfile {
    _id: string;
    businessName: string;
    description: string;
    isOnline: boolean;
    rating: number;
    ratingCount: number;
    serviceRadius: number;
    services: { name: string; price: number; estimatedTime: number; category: string }[];
    images: string[];
    location?: { address?: string; coordinates?: number[] };
}

export default function GarageProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [mechanic, setMechanic] = useState<MechanicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        Promise.all([
            fetch('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json()),
            fetch('http://localhost:5000/api/mechanics/my-profile', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : null)
        ])
            .then(([userData, mechanicData]) => {
                setUser(userData);
                setEditName(userData.name || '');
                setEditPhone(userData.phone || '');
                localStorage.setItem('user', JSON.stringify(userData));
                if (mechanicData) setMechanic(mechanicData);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    const handleSaveProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: editName, phone: editPhone })
            });
            if (res.ok) {
                const data = await res.json();
                setUser(prev => prev ? { ...prev, name: data.name, phone: data.phone } : null);
                localStorage.setItem('user', JSON.stringify({ ...user, name: data.name, phone: data.phone }));
                setEditing(false);
                showToast('Profile updated', 'success');
            } else {
                showToast('Failed to update', 'error');
            }
        } catch {
            showToast('An error occurred', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleOnline = async () => {
        const token = localStorage.getItem('token');
        if (!token || !mechanic) return;
        try {
            const res = await fetch('http://localhost:5000/api/mechanics/toggle-online', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMechanic(prev => prev ? { ...prev, isOnline: data.isOnline } : null);
                showToast(data.isOnline ? 'You are now online' : 'You are now offline', 'success');
            }
        } catch {
            showToast('Failed to toggle', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
                <div className="p-6 space-y-4">
                    <div className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                    <div className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                    <div className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                </div>
                <GarageBottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-2xl font-black text-text-main dark:text-white">My Profile</h1>
            </div>

            <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 overflow-hidden">
                        <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                    <div className="flex-1">
                        {editing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-800 p-2.5 text-sm font-bold text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                                    placeholder="Name"
                                />
                                <input
                                    type="tel"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    className="w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-800 p-2.5 text-sm font-medium text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                                    placeholder="Phone"
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50">
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white text-sm font-bold">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-text-main dark:text-white">{user?.name}</h2>
                                    <button onClick={() => setEditing(true)} className="text-primary">
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                </div>
                                <p className="text-sm text-text-sub dark:text-gray-400">{user?.email}</p>
                                {user?.phone && <p className="text-sm text-text-sub dark:text-gray-400">{user.phone}</p>}
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase">
                                    {user?.role || 'Garage Owner'}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Mechanic/Garage Info */}
                {mechanic ? (
                    <div className="rounded-2xl bg-white dark:bg-card-dark p-5 shadow-soft space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-text-main dark:text-white">{mechanic.businessName}</h3>
                            <button onClick={() => router.push('/garage/add')} className="text-primary text-sm font-bold">Edit</button>
                        </div>

                        {mechanic.description && (
                            <p className="text-sm text-text-sub dark:text-gray-400">{mechanic.description}</p>
                        )}

                        {/* Online Toggle */}
                        <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <p className="text-sm font-bold text-text-main dark:text-white">Available Online</p>
                                <p className="text-xs text-text-sub dark:text-gray-400">Show as available to drivers</p>
                            </div>
                            <button onClick={toggleOnline} className={`relative w-12 h-6 rounded-full transition-colors ${mechanic.isOnline ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${mechanic.isOnline ? 'translate-x-6' : ''}`}></span>
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="text-center">
                                <p className="text-lg font-black text-primary">{mechanic.serviceRadius} km</p>
                                <p className="text-[10px] font-bold text-text-sub dark:text-gray-400">Radius</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black text-primary">{mechanic.services.length}</p>
                                <p className="text-[10px] font-bold text-text-sub dark:text-gray-400">Services</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black text-amber-500">
                                    {mechanic.ratingCount > 0 ? mechanic.rating.toFixed(1) : '—'}
                                </p>
                                <p className="text-[10px] font-bold text-text-sub dark:text-gray-400">
                                    {mechanic.ratingCount > 0 ? `${mechanic.ratingCount} reviews` : 'No reviews'}
                                </p>
                            </div>
                        </div>

                        {/* Services List */}
                        {mechanic.services.length > 0 && (
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-sm font-bold text-text-main dark:text-white mb-2">Services</p>
                                <div className="space-y-2">
                                    {mechanic.services.map((s, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-1.5">
                                            <div>
                                                <p className="text-sm font-medium text-text-main dark:text-white">{s.name}</p>
                                                <p className="text-xs text-text-sub dark:text-gray-400">{s.category}</p>
                                            </div>
                                            <span className="text-sm font-bold text-primary">LKR {s.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        {mechanic.location?.address && (
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-text-sub text-lg">location_on</span>
                                    <p className="text-sm text-text-sub dark:text-gray-400">{mechanic.location.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-white dark:bg-card-dark p-6 shadow-soft text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">garage</span>
                        <p className="text-text-main dark:text-white font-bold mb-1">No garage profile yet</p>
                        <p className="text-sm text-text-sub dark:text-gray-400 mb-4">Set up your garage to start receiving repair requests</p>
                        <button
                            onClick={() => router.push('/garage/add')}
                            className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                        >
                            Register Garage
                        </button>
                    </div>
                )}

                {/* Quick Links */}
                <div className="space-y-2">
                    <button onClick={() => router.push('/garage/my-bids')} className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-card-dark shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">gavel</span>
                            <span className="text-sm font-bold text-text-main dark:text-white">My Bids</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                    </button>
                    <button onClick={() => router.push('/garage/repairs')} className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-card-dark shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">handyman</span>
                            <span className="text-sm font-bold text-text-main dark:text-white">Browse Repairs</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                    </button>
                </div>

                {/* Logout */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3.5 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <GarageBottomNav />
        </div>
    );
}
