"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParkingBottomNav } from '@/components/ui/ParkingBottomNav';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    avatarUrl?: string;
    createdAt?: string;
}

export default function ParkingOwnerProfile() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setForm({ name: data.name || '', phone: data.phone || '' });
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    const handleSave = async () => {
        setSaving(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                const updated = await res.json();
                setUser(prev => prev ? { ...prev, ...updated } : prev);
                // Update localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    parsed.name = updated.name;
                    localStorage.setItem('user', JSON.stringify(parsed));
                }
                setEditing(false);
            } else {
                alert('Failed to update profile');
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-display">
            <div className="px-6 pt-8 pb-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="rounded-full p-2 -ml-2 text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-extrabold text-text-main dark:text-white">Profile</h1>
            </div>

            {/* Avatar & Info */}
            <div className="flex flex-col items-center px-6 pb-6">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg mb-4">
                    {user?.avatarUrl ? (
                        <div className="h-full w-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${user.avatarUrl}")` }}></div>
                    ) : (
                        <span className="material-symbols-outlined text-primary text-5xl">person</span>
                    )}
                </div>
                <h2 className="text-xl font-bold text-text-main dark:text-white">{user?.name}</h2>
                <p className="text-sm text-text-sub dark:text-gray-400">{user?.email}</p>
                <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                    {user?.role}
                </span>
            </div>

            {/* Profile Details */}
            <div className="px-6 space-y-4">
                <div className="bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-text-main dark:text-white">Personal Info</h3>
                        {!editing && (
                            <button onClick={() => setEditing(true)} className="text-sm font-bold text-primary hover:underline">
                                Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-sub dark:text-gray-400 uppercase mb-2">Name</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full rounded-xl border-0 bg-gray-50 dark:bg-gray-800 p-4 text-text-main dark:text-white ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all"
                                    type="text"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-sub dark:text-gray-400 uppercase mb-2">Phone</label>
                                <input
                                    value={form.phone}
                                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full rounded-xl border-0 bg-gray-50 dark:bg-gray-800 p-4 text-text-main dark:text-white ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all"
                                    type="tel"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 rounded-xl bg-primary py-3 text-center font-bold text-white shadow-glow transition-all active:scale-[0.98] disabled:opacity-70"
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setForm({ name: user?.name || '', phone: user?.phone || '' });
                                    }}
                                    className="rounded-xl px-6 py-3 font-bold text-text-sub bg-gray-100 dark:bg-gray-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-500">person</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-sub dark:text-gray-400 uppercase">Name</p>
                                    <p className="text-base font-medium text-text-main dark:text-white">{user?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-500">mail</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-sub dark:text-gray-400 uppercase">Email</p>
                                    <p className="text-base font-medium text-text-main dark:text-white">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-500">phone</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-sub dark:text-gray-400 uppercase">Phone</p>
                                    <p className="text-base font-medium text-text-main dark:text-white">{user?.phone || 'Not set'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-card-dark rounded-2xl shadow-soft overflow-hidden">
                    <button onClick={() => router.push('/parking-owner/spots')} className="flex w-full items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600">local_parking</span>
                        </div>
                        <span className="text-base font-medium text-text-main dark:text-white flex-1 text-left">My Parking Spots</span>
                        <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                    </button>
                    <button onClick={() => router.push('/parking-owner/bookings')} className="flex w-full items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">calendar_month</span>
                        </div>
                        <span className="text-base font-medium text-text-main dark:text-white flex-1 text-left">Manage Bookings</span>
                        <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                    </button>
                    <button onClick={() => router.push('/parking-owner/rates')} className="flex w-full items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-600">price_change</span>
                        </div>
                        <span className="text-base font-medium text-text-main dark:text-white flex-1 text-left">Manage Rates</span>
                        <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                    </button>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 py-4 text-base font-bold text-red-600 dark:text-red-400 transition-all active:scale-[0.98] hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Log Out
                </button>
            </div>

            <div className="h-8"></div>

            <ParkingBottomNav />
        </div>
    );
}
