"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { email, password } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));

                // Role-based redirect
                // Role-based redirect
                if (data.role === 'Garage Owner') {
                    router.push('/garage/dashboard');
                } else if (data.role === 'Parking Owner') {
                    router.push('/parking-owner/dashboard');
                } else {
                    router.push('/driver/dashboard');
                }
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300">
            {/* Content Container */}
            <main className="w-full max-w-[420px] mx-auto flex flex-col gap-8 relative z-10 text-center md:text-left">
                {/* Header */}
                <header className="flex flex-col items-center text-center space-y-6">

                    <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold text-text-main dark:text-white tracking-tight">Welcome Back</h1>
                        <p className="text-text-sub dark:text-slate-400 font-medium text-base">Login to access your garage.</p>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                    {/* Email Input */}
                    <div className="group text-left">
                        <label className="block text-text-main dark:text-gray-200 text-sm font-semibold mb-2 ml-1 transition-colors group-focus-within:text-primary" htmlFor="email">Email or Phone Number</label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 flex items-center justify-center text-text-sub group-focus-within:text-primary transition-colors pointer-events-none">
                                <span className="material-symbols-outlined text-[22px]">mail</span>
                            </div>
                            <input
                                className="w-full h-14 pl-12 pr-4 bg-surface-light dark:bg-surface-dark border-2 border-transparent focus:border-primary/20 hover:bg-white dark:hover:bg-[#1f2f36] rounded-lg text-text-main dark:text-white placeholder:text-text-sub/50 focus:outline-none focus:ring-0 shadow-input transition-all duration-200 font-medium"
                                id="email"
                                name="email"
                                placeholder="user@example.com"
                                type="text"
                                value={email}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="group text-left">
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-text-main dark:text-gray-200 text-sm font-semibold transition-colors group-focus-within:text-primary" htmlFor="password">Password</label>
                        </div>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 flex items-center justify-center text-text-sub group-focus-within:text-primary transition-colors pointer-events-none">
                                <span className="material-symbols-outlined text-[22px]">lock_open</span>
                            </div>
                            <input
                                className="w-full h-14 pl-12 pr-12 bg-surface-light dark:bg-surface-dark border-2 border-transparent focus:border-primary/20 hover:bg-white dark:hover:bg-[#1f2f36] rounded-lg text-text-main dark:text-white placeholder:text-text-sub/50 focus:outline-none focus:ring-0 shadow-input transition-all duration-200 font-medium"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={onChange}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-4 text-text-sub hover:text-primary transition-colors flex items-center p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <span className="material-symbols-outlined text-[22px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                        <div className="flex justify-end mt-2">
                            <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:text-[#136f8e] transition-colors">Forgot Password?</Link>
                        </div>
                    </div>

                    {/* Primary Action */}
                    <button
                        className="mt-2 w-full h-14 bg-primary text-white font-bold rounded-lg shadow-glow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        ) : (
                            <>
                                <span>Login securely</span>
                                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                            </>
                        )}
                    </button>
                </form>



                {/* Footer */}
                <footer className="mt-2 text-center">
                    <p className="text-text-sub dark:text-gray-400 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">Sign Up</Link>
                    </p>
                </footer>
            </main>

            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full pointer-events-none"></div>
        </div>
    );
}
