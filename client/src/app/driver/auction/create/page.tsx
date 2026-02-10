"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VehicleSelector } from '@/components/features/VehicleSelector';
import { Toast } from '@/components/ui/Toast';

export default function PostAuctionPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        isDrivable: true,
        description: '',
        images: [] as File[],
        imagePreviews: [] as string[]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleDrivableToggle = () => {
        setFormData(prev => ({ ...prev, isDrivable: !prev.isDrivable }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newFiles],
                imagePreviews: [...prev.imagePreviews, ...newPreviews]
            }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            const newPreviews = [...prev.imagePreviews];
            newImages.splice(index, 1);
            newPreviews.splice(index, 1);
            return { ...prev, images: newImages, imagePreviews: newPreviews };
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('make', formData.make);
            data.append('model', formData.model);
            data.append('year', formData.year);
            data.append('drivable', String(formData.isDrivable));
            data.append('description', formData.description);
            // Default values for now as they aren't in the form explicitly yet
            data.append('title', `${formData.year} ${formData.make || 'Vehicle'} Repair`);

            formData.images.forEach((image) => {
                data.append('photos', image);
            });

            const token = localStorage.getItem('token');
            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/auctions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (res.ok) {
                router.push('/driver/auction');
            } else {
                const errData = await res.json();
                setError(errData.message || 'Failed to post auction');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-text-light antialiased selection:bg-primary/20 min-h-screen flex flex-col pb-24">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {/* Top Navigation */}
            <div className="sticky top-0 z-50 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 px-4 py-3 backdrop-blur-md transition-colors border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => router.back()}
                    className="group flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                >
                    <span className="material-symbols-outlined text-text-main dark:text-text-light transition-transform group-hover:-translate-x-0.5">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight text-text-main dark:text-text-light">Post Auction</h2>
                <button
                    onClick={() => router.back()}
                    className="rounded-full px-3 py-1 text-sm font-bold text-primary transition-opacity hover:opacity-80"
                >
                    Cancel
                </button>
            </div>

            {/* Main Content */}
            <main className="flex flex-col gap-6 p-4 pt-2">
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold">
                        {error}
                    </div>
                )}

                {/* Photo Upload Section */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-baseline justify-between px-1">
                        <h3 className="text-lg font-bold text-text-main dark:text-text-light">Photos</h3>
                        <span className="text-xs font-medium text-primary">Required</span>
                    </div>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark px-1">
                        Upload clear photos of the damage to get accurate quotes.
                    </p>

                    {/* Horizontal Scroll Photo List */}
                    <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-2">
                        {/* Add Button */}
                        <label className="group relative flex h-40 w-32 flex-none flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 transition-all active:scale-95 dark:border-primary/40 dark:bg-primary/10 cursor-pointer">
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-float transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined">add_a_photo</span>
                            </div>
                            <span className="text-xs font-semibold text-primary">Add Photo</span>
                        </label>

                        {/* Images */}
                        {formData.imagePreviews.map((src, index) => (
                            <div key={index} className="relative h-40 w-32 flex-none overflow-hidden rounded-xl shadow-sm group">
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm hover:bg-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[14px] text-white">close</span>
                                </button>
                                <div
                                    className="h-full w-full bg-cover bg-center transition-transform group-hover:scale-105"
                                    style={{ backgroundImage: `url('${src}')` }}
                                ></div>
                            </div>
                        ))}

                        {/* Placeholder Ghost Card (Hinting at scroll) */}
                        <div className="flex h-40 w-8 flex-none items-center justify-center opacity-30">
                            <div className="h-full w-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                    </div>
                </section>

                {/* Vehicle Details Card */}
                <section className="rounded-2xl bg-surface-light dark:bg-surface-dark p-5 shadow-soft">
                    <h3 className="mb-4 text-lg font-bold text-text-main dark:text-text-light">Vehicle Details</h3>
                    <div className="space-y-5">
                        {/* Vehicle Selector from Garage */}
                        <VehicleSelector
                            onVehicleChange={(details) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    make: details.make,
                                    model: details.model,
                                    year: details.year
                                }));
                            }}
                            initialValues={{ make: formData.make, model: formData.model, year: formData.year }}
                        />
                        {/* Make & Model */}
                        <div className="group relative">
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted-dark" htmlFor="make">Make & Model</label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-3 text-text-muted dark:text-gray-500">directions_car</span>
                                <input
                                    className="w-full rounded-xl border-0 bg-background-light dark:bg-background-dark py-3.5 pl-10 pr-4 text-sm font-medium text-text-main placeholder-gray-400 ring-1 ring-inset ring-gray-200 transition-all focus:ring-2 focus:ring-primary dark:text-white dark:ring-gray-700 dark:placeholder-gray-600"
                                    id="make"
                                    placeholder="e.g. Toyota Camry"
                                    type="text"
                                    value={formData.make}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="group relative">
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted-dark" htmlFor="model">Model</label>
                            <input
                                className="w-full rounded-xl border-0 bg-background-light dark:bg-background-dark py-3.5 px-4 text-sm font-medium text-text-main placeholder-gray-400 ring-1 ring-inset ring-gray-200 transition-all focus:ring-2 focus:ring-primary dark:text-white dark:ring-gray-700 dark:placeholder-gray-600"
                                id="model"
                                placeholder="e.g. Camry"
                                type="text"
                                value={formData.model}
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* Year & Drivable Row */}
                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted-dark" htmlFor="year">Year</label>
                                <input
                                    className="w-full rounded-xl border-0 bg-background-light dark:bg-background-dark py-3.5 px-4 text-center text-sm font-medium text-text-main placeholder-gray-400 ring-1 ring-inset ring-gray-200 transition-all focus:ring-2 focus:ring-primary dark:text-white dark:ring-gray-700 dark:placeholder-gray-600"
                                    id="year"
                                    placeholder="2020"
                                    type="number"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex flex-1 items-center justify-between rounded-xl bg-background-light dark:bg-background-dark px-4 py-2 ring-1 ring-inset ring-gray-200 dark:ring-gray-700">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-main dark:text-text-light">Drivable?</span>
                                    <span className="text-[10px] text-text-muted">Is it safe to drive?</span>
                                </div>
                                {/* Styled Toggle */}
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={formData.isDrivable}
                                        onChange={handleDrivableToggle}
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-600 dark:border-gray-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Description Section */}
                <section className="flex flex-col gap-3">
                    <div className="rounded-2xl bg-surface-light dark:bg-surface-dark p-5 shadow-soft">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-text-main dark:text-text-light">The Issue</h3>
                            <span className="material-symbols-outlined text-text-muted dark:text-gray-500">edit_note</span>
                        </div>
                        <textarea
                            className="w-full resize-none rounded-xl border-0 bg-background-light dark:bg-background-dark p-4 text-sm leading-relaxed text-text-main placeholder-gray-400 ring-1 ring-inset ring-gray-200 transition-all focus:ring-2 focus:ring-primary dark:text-white dark:ring-gray-700 dark:placeholder-gray-600 focus:outline-none"
                            id="description"
                            placeholder="Describe the noise, leak, or damage location in detail..."
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                        ></textarea>
                        <div className="mt-2 flex justify-end">
                            <span className="text-[10px] font-medium text-text-muted dark:text-gray-600">{formData.description.length}/500</span>
                        </div>
                    </div>
                    {/* Helper Tip with Accent Color */}
                    <div className="flex gap-3 rounded-lg border border-accent/20 bg-accent/5 p-3 dark:bg-accent/10">
                        <span className="material-symbols-outlined shrink-0 text-accent" style={{ fontSize: '20px' }}>lightbulb</span>
                        <p className="text-xs font-medium leading-normal text-text-main dark:text-text-light/90">
                            <span className="font-bold text-accent">Tip:</span> Mechanics quote 20% faster when the VIN number is included in the photos.
                        </p>
                    </div>
                </section>
            </main>

            {/* Sticky Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white/80 dark:border-gray-800 dark:bg-[#21242c]/90 px-4 py-4 backdrop-blur-lg z-40">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                        <>
                            <span>Post Auction</span>
                            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
