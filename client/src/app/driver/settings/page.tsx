"use client";

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

export default function DriverSettingsPage() {
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('http://mechaniclk-devthon-production.up.railway.app/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setForm({ name: data.name || '', phone: data.phone || '', email: data.email || '' });
            setLoading(false);
        };

        loadProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://mechaniclk-devthon-production.up.railway.app/api/users/profile', {
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
            setMessage('Profile updated.');
        } catch (err: any) {
            setMessage(err.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <div className="px-6 pt-8 pb-4">
                <h1 className="text-2xl font-black text-text-main dark:text-white">Settings</h1>
                <p className="text-sm text-text-sub dark:text-gray-400">Update your account details.</p>
            </div>

            <div className="px-6 space-y-4">
                {message && (
                    <div className="rounded-xl bg-primary/10 text-primary p-3 text-sm font-bold">{message}</div>
                )}

                <div className="rounded-2xl bg-white dark:bg-card-dark p-4 shadow-soft border border-gray-100 dark:border-gray-800">
                    <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-2">Name</label>
                    <input
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mt-4 mb-2">Phone</label>
                    <input
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mt-4 mb-2">Email</label>
                    <input
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm opacity-70"
                        value={form.email}
                        disabled
                    />
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
