"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'Driver' // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { name, email, phone, password, role } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data));
                    if (data.role === 'Garage Owner') {
                        router.push('/garage/dashboard');
                    } else if (data.role === 'Parking Owner') {
                        router.push('/parking-owner/dashboard');
                    } else {
                        router.push('/driver/dashboard');
                    }
                } else {
                    router.push('/login');
                }
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'Driver', label: 'Driver', icon: 'directions_car' },
        { id: 'Garage Owner', label: 'Mechanic', icon: 'build' },
        { id: 'Parking Owner', label: 'Parking', icon: 'local_parking' },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300">
            {/* Content Container */}
            <main className="w-full max-w-[600px] mx-auto flex flex-col gap-6 relative z-10 text-center md:text-left">
                {/* Header */}
                <header className="flex flex-col items-center text-center space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold text-text-main dark:text-white tracking-tight">Create Account</h1>
                        <p className="text-text-sub dark:text-slate-400 font-medium text-base">Join Mechanic.LK today.</p>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                {/* Register Form */}
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>

                    {/* Role Selection */}
                    <div className="grid grid-cols-3 gap-3 mb-2">
                        {roles.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, role: r.id })}
                                className={`
                                    p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200
                                    ${role === r.id
                                        ? 'border-primary bg-primary/5 text-primary shadow-glow'
                                        : 'border-transparent bg-surface-light dark:bg-surface-dark text-gray-400 hover:bg-white dark:hover:bg-[#1f2f36]'
                                    }
                                `}
                            >
                                <span className={`material-symbols-outlined text-2xl ${role === r.id ? 'font-variation-filled' : ''}`}>{r.icon}</span>
                                <span className="text-xs font-bold">{r.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1: Name & Email */}
                        <div className="flex flex-col gap-4">
                            {/* Name Input */}
                            <div className="group text-left">
                                <label className="block text-text-main dark:text-gray-200 text-sm font-semibold mb-2 ml-1 transition-colors group-focus-within:text-primary" htmlFor="name">Full Name</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 flex items-center justify-center text-text-sub group-focus-within:text-primary transition-colors pointer-events-none">
                                        <span className="material-symbols-outlined text-[22px]">person</span>
                                    </div>
                                    <input
                                        className="w-full h-14 pl-12 pr-4 bg-surface-light dark:bg-surface-dark border-2 border-transparent focus:border-primary/20 hover:bg-white dark:hover:bg-[#1f2f36] rounded-lg text-text-main dark:text-white placeholder:text-text-sub/50 focus:outline-none focus:ring-0 shadow-input transition-all duration-200 font-medium"
                                        id="name"
                                        name="name"
                                        placeholder="John Doe"
                                        type="text"
                                        value={name}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="group text-left">
                                <label className="block text-text-main dark:text-gray-200 text-sm font-semibold mb-2 ml-1 transition-colors group-focus-within:text-primary" htmlFor="email">Email Address</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 flex items-center justify-center text-text-sub group-focus-within:text-primary transition-colors pointer-events-none">
                                        <span className="material-symbols-outlined text-[22px]">mail</span>
                                    </div>
                                    <input
                                        className="w-full h-14 pl-12 pr-4 bg-surface-light dark:bg-surface-dark border-2 border-transparent focus:border-primary/20 hover:bg-white dark:hover:bg-[#1f2f36] rounded-lg text-text-main dark:text-white placeholder:text-text-sub/50 focus:outline-none focus:ring-0 shadow-input transition-all duration-200 font-medium"
                                        id="email"
                                        name="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        value={email}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Phone & Password */}
                        <div className="flex flex-col gap-4">
                            {/* Phone Input */}
                            <div className="group text-left">
                                <label className="block text-text-main dark:text-gray-200 text-sm font-semibold mb-2 ml-1 transition-colors group-focus-within:text-primary" htmlFor="phone">Phone Number</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 flex items-center justify-center text-text-sub group-focus-within:text-primary transition-colors pointer-events-none">
                                        <span className="material-symbols-outlined text-[22px]">call</span>
                                    </div>
                                    <input
                                        className="w-full h-14 pl-12 pr-4 bg-surface-light dark:bg-surface-dark border-2 border-transparent focus:border-primary/20 hover:bg-white dark:hover:bg-[#1f2f36] rounded-lg text-text-main dark:text-white placeholder:text-text-sub/50 focus:outline-none focus:ring-0 shadow-input transition-all duration-200 font-medium"
                                        id="phone"
                                        name="phone"
                                        placeholder="+94 77 123 4567"
                                        type="tel"
                                        value={phone}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="group text-left">
                                <label className="block text-text-main dark:text-gray-200 text-sm font-semibold mb-2 ml-1 transition-colors group-focus-within:text-primary" htmlFor="password">Password</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 flex items-center justify-center text-text-sub group-focus-within:text-primary transition-colors pointer-events-none">
                                        <span className="material-symbols-outlined text-[22px]">lock_open</span>
                                    </div>
                                    <input
                                        className="w-full h-14 pl-12 pr-12 bg-surface-light dark:bg-surface-dark border-2 border-transparent focus:border-primary/20 hover:bg-white dark:hover:bg-[#1f2f36] rounded-lg text-text-main dark:text-white placeholder:text-text-sub/50 focus:outline-none focus:ring-0 shadow-input transition-all duration-200 font-medium"
                                        id="password"
                                        name="password"
                                        placeholder="Create a password"
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
                            </div>
                        </div>
                    </div>

                    {/* Primary Action */}
                    <button
                        className="mt-4 w-full h-14 bg-primary text-white font-bold rounded-lg shadow-glow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                            </>
                        )}
                    </button>
                </form>



               

                {/* Footer */}
                <footer className="mt-2 text-center">
                    <p className="text-text-sub dark:text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">Log In</Link>
                    </p>
                </footer>
            </main>

            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full pointer-events-none"></div>
        </div>
    );
}
