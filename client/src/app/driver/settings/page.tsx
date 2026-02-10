"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import { Toast } from '@/components/ui/Toast';

export default function DriverSettingsPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setForm({ name: data.name || '', phone: data.phone || '', email: data.email || '' });
            } catch {
                setToast({ message: 'Failed to load profile', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [router]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: form.name, phone: form.phone })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to update');
            }
            localStorage.setItem('user', JSON.stringify(data));
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || 'Something went wrong', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.current || !passwordForm.newPass) {
            setToast({ message: 'Please fill in all password fields', type: 'error' });
            return;
        }
        if (passwordForm.newPass !== passwordForm.confirm) {
            setToast({ message: 'Passwords do not match', type: 'error' });
            return;
        }
        if (passwordForm.newPass.length < 6) {
            setToast({ message: 'Password must be at least 6 characters', type: 'error' });
            return;
        }
        setChangingPassword(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.current,
                    newPassword: passwordForm.newPass
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to change password');
            }
            setPasswordForm({ current: '', newPass: '', confirm: '' });
            setToast({ message: 'Password changed successfully!', type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || 'Something went wrong', type: 'error' });
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 flex items-center justify-center">
                <div className="animate-pulse text-text-sub">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="px-6 pt-8 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="rounded-full p-2 text-text-sub hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-text-main dark:text-white">Settings</h1>
                        <p className="text-sm text-text-sub dark:text-gray-400">Update your account details.</p>
                    </div>
                </div>
            </div>

            <div className="px-6 space-y-4">
                {/* Profile Info */}
                <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">Profile Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-1">Name</label>
                            <input
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-1">Phone</label>
                            <input
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+94 7X XXX XXXX"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-1">Email</label>
                            <input
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm opacity-70"
                                value={form.email}
                                disabled
                            />
                            <p className="text-[10px] text-text-sub mt-1">Email cannot be changed.</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Password Change */}
                <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">Change Password</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-1">Current Password</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm"
                                value={passwordForm.current}
                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-1">New Password</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm"
                                value={passwordForm.newPass}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                                placeholder="Min 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2.5 text-sm"
                                value={passwordForm.confirm}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                            />
                        </div>
                        <button
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className="w-full rounded-xl bg-gray-800 dark:bg-gray-700 py-3 text-sm font-bold text-white hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-60"
                        >
                            {changingPassword ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="rounded-2xl bg-white dark:bg-card-dark p-2 shadow-soft border border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => router.push('/driver/garage')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400">garage</span>
                            <span className="font-bold text-text-main dark:text-white">My Garage</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </button>
                    <button
                        onClick={() => router.push('/driver/wallet')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400">account_balance_wallet</span>
                            <span className="font-bold text-text-main dark:text-white">Wallet & Payments</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
