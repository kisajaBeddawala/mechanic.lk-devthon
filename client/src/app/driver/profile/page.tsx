"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            fetch('https://mechaniclk-devthon-production.up.railway.app/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                })
                .catch(err => console.error(err));
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) return <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <div className="relative h-48 bg-gradient-to-br from-primary to-blue-600">
                <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-full border-4 border-white dark:border-background-dark bg-white dark:bg-card-dark flex items-center justify-center text-4xl font-bold text-primary shadow-lg overflow-hidden">
                    {user.name.charAt(0)}
                </div>
            </div>

            <main className="pt-14 px-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-text-main dark:text-white">{user.name}</h1>
                    <p className="text-sm font-medium text-text-sub dark:text-gray-400">{user.email}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary mt-1">{user.role}</p>
                </div>

                <div className="bg-white dark:bg-card-dark rounded-2xl p-2 shadow-soft border border-gray-100 dark:border-gray-800">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400">settings</span>
                            <span className="font-bold text-text-main dark:text-white">Settings</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400">help</span>
                            <span className="font-bold text-text-main dark:text-white">Help & Support</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-red-500"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-bold">Log Out</span>
                        </div>
                    </button>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
