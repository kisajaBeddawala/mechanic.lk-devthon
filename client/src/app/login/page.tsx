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

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700/50"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Or continue with</span>
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700/50"></div>
                </div>

                {/* Social Login Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="relative h-14 flex items-center justify-center gap-3 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-[#1f2f36] transition-all group overflow-hidden">
                        <div className="w-6 h-6 flex items-center justify-center">
                            {/* Google SVG */}
                            <svg className="w-full h-full" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </div>
                        <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">Google</span>
                    </button>
                    <button className="relative h-14 flex items-center justify-center gap-3 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-[#1f2f36] transition-all group overflow-hidden">
                        <div className="w-6 h-6 flex items-center justify-center text-black dark:text-white">
                            {/* Apple SVG */}
                            <svg className="w-full h-full fill-current group-hover:fill-primary transition-colors" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.3-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.68-.83 1.14-1.99.94-3.14-1.07.05-2.36.72-3.13 1.6-.66.75-1.24 1.95-1.01 3.11 1.19.09 2.4-.73 3.2-1.57z"></path>
                            </svg>
                        </div>
                        <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">Apple</span>
                    </button>
                </div>

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
