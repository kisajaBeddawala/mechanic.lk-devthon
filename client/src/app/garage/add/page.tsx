"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GarageBottomNav } from '@/components/ui/GarageBottomNav';

export default function AddGaragePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        businessName: '',
        description: '',
        serviceRadius: 10,
        address: '',
        latitude: '',
        longitude: ''
    });
    const [isOnline, setIsOnline] = useState(true);
    const [services, setServices] = useState([
        { name: '', price: '', estimatedTime: '', category: 'Routine Maintenance' }
    ]);
    const [images, setImages] = useState<File[]>([]); // To store selected files
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleServiceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newServices = [...services];
        newServices[index] = { ...newServices[index], [e.target.name]: e.target.value };
        setServices(newServices);
    };

    const addService = () => {
        setServices([...services, { name: '', price: '', estimatedTime: '', category: 'Routine Maintenance' }]);
    };

    const removeService = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages([...images, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previewUrls];
        URL.revokeObjectURL(newPreviews[index]); // Cleanup
        newPreviews.splice(index, 1);
        setPreviewUrls(newPreviews);
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString()
                    });
                },
                (error) => {
                    console.error("Error getting location", error);
                    alert("Could not get location. Please enter manually or enable GPS.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const data = new FormData();
            data.append('businessName', formData.businessName);
            data.append('description', formData.description);
            data.append('serviceRadius', formData.serviceRadius.toString());
            data.append('isOnline', isOnline.toString());

            // Construct Location JSON
            const location = {
                type: 'Point',
                coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
                address: formData.address
            };
            data.append('location', JSON.stringify(location));

            // Construct Services JSON
            // Clean up services (remove empty ones or ensure numbers)
            const cleanedServices = services.map(s => ({
                name: s.name,
                price: Number(s.price),
                estimatedTime: Number(s.estimatedTime),
                category: s.category
            }));
            data.append('services', JSON.stringify(cleanedServices));

            // Append Images
            images.forEach(image => {
                data.append('images', image);
            });

            const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/mechanics', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                    // 'Content-Type': 'multipart/form-data' // DO NOT SET THIS MANUALLY with FormData
                },
                body: data
            });

            if (res.ok) {
                alert('Garage spot added successfully!');
                router.push('/garage/dashboard');
            } else {
                const err = await res.json();
                alert(`Failed: ${err.message}`);
            }
        } catch (error) {
            console.error("Error submitting garage", error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-background-light dark:bg-background-dark pb-24">
            {/* Header */}
            <div className="fixed top-0 z-30 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                <button onClick={() => router.back()} className="rounded-full p-2 -ml-2 text-text-main hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-text-main dark:text-white">Register Garage</h1>
                <div className="w-10"></div>
            </div>

            <main className="pt-24 px-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-text-main dark:text-white">Business Details</label>
                        <input
                            type="text"
                            name="businessName"
                            placeholder="Garage Name"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-sm font-medium text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all placeholder:text-text-sub"
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Description (Specialties, etc.)"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-sm font-medium text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all placeholder:text-text-sub"
                            rows={3}
                        />
                    </div>

                    {/* Online Toggle */}
                    <div className="flex items-center justify-between rounded-xl bg-white dark:bg-card-dark p-4 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700">
                        <div>
                            <p className="text-sm font-bold text-text-main dark:text-white">Available Online</p>
                            <p className="text-xs text-text-sub dark:text-gray-400">Show as available to drivers</p>
                        </div>
                        <button type="button" onClick={() => setIsOnline(!isOnline)} className={`relative w-12 h-6 rounded-full transition-colors ${isOnline ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isOnline ? 'translate-x-6' : ''}`}></span>
                        </button>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-text-main dark:text-white">Location</label>

                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
                        >
                            <span className="material-symbols-outlined">my_location</span>
                            Get Current Location
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="latitude"
                                placeholder="Latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-sm font-medium text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all placeholder:text-text-sub"
                                required
                            />
                            <input
                                type="text"
                                name="longitude"
                                placeholder="Longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-sm font-medium text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all placeholder:text-text-sub"
                                required
                            />
                        </div>
                        <input
                            type="text"
                            name="address"
                            placeholder="Street Address (Optional)"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-sm font-medium text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all placeholder:text-text-sub"
                        />
                        <input
                            type="number"
                            name="serviceRadius"
                            placeholder="Service Radius (km)"
                            value={formData.serviceRadius}
                            onChange={handleChange}
                            className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-sm font-medium text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all placeholder:text-text-sub"
                        />
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-text-main dark:text-white">Photos</label>
                        <div className="flex flex-wrap gap-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative h-20 w-20 rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
                                    <img src={url} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>
                            ))}
                            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-card-dark dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined text-text-sub">add_photo_alternate</span>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-text-main dark:text-white">Services Offered</label>
                            <button type="button" onClick={addService} className="text-sm font-bold text-primary hover:underline">+ Add Service</button>
                        </div>

                        {services.map((service, index) => (
                            <div key={index} className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-card-dark relative">
                                {index > 0 &&
                                    <button type="button" onClick={() => removeService(index)} className="absolute top-2 right-2 text-text-sub hover:text-red-500">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                }
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Service Name (e.g. Oil Change)"
                                    value={service.name}
                                    onChange={(e) => handleServiceChange(index, e)}
                                    className="w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-600 focus:ring-2 focus:ring-primary transition-all placeholder:text-text-sub"
                                    required
                                />
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="Price (LKR)"
                                        value={service.price}
                                        onChange={(e) => handleServiceChange(index, e)}
                                        className="w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-600 focus:ring-2 focus:ring-primary transition-all placeholder:text-text-sub"
                                        required
                                    />
                                    <select
                                        name="category"
                                        value={service.category}
                                        onChange={(e) => handleServiceChange(index, e)}
                                        className="w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-600 focus:ring-2 focus:ring-primary transition-all"
                                    >
                                        <option value="Routine Maintenance">Maintenance</option>
                                        <option value="Repair">Repair</option>
                                        <option value="Inspection">Inspection</option>
                                        <option value="Towing">Towing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <input
                                    type="number"
                                    name="estimatedTime"
                                    placeholder="Est. Time (mins)"
                                    value={service.estimatedTime}
                                    onChange={(e) => handleServiceChange(index, e)}
                                    className="w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-600 focus:ring-2 focus:ring-primary transition-all placeholder:text-text-sub"
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full rounded-xl bg-primary py-4 text-base font-bold text-white shadow-glow hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : 'Register Garage'}
                    </button>
                </form>
            </main>
            <GarageBottomNav />
        </div>
    );
}
