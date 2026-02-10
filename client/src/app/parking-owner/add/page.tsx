"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), { ssr: false });

export default function AddSpotPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amenities: [] as string[],
        address: '',
        city: '',
        zip: '',
        latitude: '',
        longitude: '',
        pricePerHour: 5.00,
        dailyMaxRate: 35.00,
        vehicleTypes: [] as string[],
        daysActive: ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'],
        startTime: '08:00',
        endTime: '18:00'
    });

    // Handle Input Changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Toggle Amenities
    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    // Toggle Vehicle Types
    const toggleVehicleType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            vehicleTypes: prev.vehicleTypes.includes(type)
                ? prev.vehicleTypes.filter(t => t !== type)
                : [...prev.vehicleTypes, type]
        }));
    };

    // Map Interaction (Simulated) - REMOVED for Real Map


    // Get Current Location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude.toFixed(6),
                        longitude: position.coords.longitude.toFixed(6)
                    }));
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    alert("Could not get your location.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    // Validation
    const isStep1Valid = formData.title && formData.description;
    const isStep2Valid = formData.address && formData.city && formData.latitude && formData.longitude;
    const isStep3Valid = formData.pricePerHour > 0;

    // Submit
    const handleSubmit = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            // Adjust payload to match backend schema (as seen in ParkingSpot.js)
            const payload = {
                title: formData.title,
                description: formData.description,
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)], // GeoJSON expects [lng, lat]
                    address: formData.address,
                    streetAddress: formData.address,
                    city: formData.city,
                    zipCode: formData.zip
                },
                pricePerHour: parseFloat(formData.pricePerHour.toString()),
                dailyMaxRate: parseFloat(formData.dailyMaxRate.toString()),
                vehicleTypes: formData.vehicleTypes,
                features: formData.amenities, // Frontend calls them amenities, backend features
                availability: {
                    days: formData.daysActive,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    isAvailable: true
                }
            };

            // Using POST /api/parking as educated guess
            const res = await fetch('http://mechaniclk-devthon-production.up.railway.app/api/parking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Parking spot created successfully!');
                router.push('/parking-owner/dashboard');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to create parking spot');
            }
        } catch (error) {
            console.error("Error creating spot:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-display transition-colors duration-200 antialiased">

            {/* Header / Progress */}
            <div className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md pt-8 px-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="rounded-full p-2 -ml-2 text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-extrabold leading-tight tracking-tight text-text-main dark:text-white">
                        Add New Spot
                    </h1>
                </div>

                <div className="mt-6 flex items-center justify-between px-4">
                    {/* Step 1 Indicator */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-glow transition-colors ${step >= 1 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                            {step > 1 ? <span className="material-symbols-outlined text-sm font-bold">check</span> : <span className="text-xs font-bold">1</span>}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>Basic Info</span>
                    </div>

                    <div className={`h-[2px] flex-1 mx-2 transition-colors ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

                    {/* Step 2 Indicator */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-glow transition-colors ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                            {step > 2 ? <span className="material-symbols-outlined text-sm font-bold">check</span> : <span className="text-xs font-bold">2</span>}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>Location</span>
                    </div>

                    <div className={`h-[2px] flex-1 mx-2 transition-colors ${step >= 3 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

                    {/* Step 3 Indicator */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-glow transition-colors ${step >= 3 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                            <span className="text-xs font-bold">3</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>Pricing</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 px-6 py-6 flex-grow">

                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-text-main dark:text-gray-200">Spot Name / Title</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary transition-all sm:text-sm sm:leading-6"
                                    placeholder="e.g. Downtown Secure Garage A1"
                                    type="text"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-text-main dark:text-gray-200">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary transition-all sm:text-sm sm:leading-6 resize-none"
                                    placeholder="Describe access instructions, size limits, etc."
                                    rows={3}
                                ></textarea>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-text-main dark:text-gray-200">Amenities</label>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {['CCTV', 'Covered', 'EV Charging', '24/7 Access'].map((amenity) => (
                                    <div
                                        key={amenity}
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`cursor-pointer flex flex-col items-center justify-center rounded-xl p-3 shadow-sm ring-1 transition-all h-24 ${formData.amenities.includes(amenity)
                                            ? 'bg-primary/5 ring-primary'
                                            : 'bg-white dark:bg-card-dark ring-gray-200 dark:ring-gray-700 hover:ring-primary/50'
                                            }`}
                                    >
                                        <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${formData.amenities.includes(amenity)
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            }`}>
                                            <span className="material-symbols-outlined">
                                                {amenity === 'CCTV' ? 'videocam' :
                                                    amenity === 'Covered' ? 'roofing' :
                                                        amenity === 'EV Charging' ? 'ev_station' : 'schedule'}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-semibold ${formData.amenities.includes(amenity) ? 'text-primary' : 'text-text-main dark:text-gray-400'}`}>
                                            {amenity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                            <button
                                onClick={() => isStep1Valid && setStep(2)}
                                disabled={!isStep1Valid}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-glow transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step
                                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: LOCATION */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-text-main dark:text-gray-200">Pin Location</label>
                                <button onClick={() => setFormData(prev => ({ ...prev, latitude: '', longitude: '' }))} className="text-xs text-primary font-semibold cursor-pointer hover:underline">Reset Pin</button>
                            </div>

                            {/* Map Component */}
                            <div className="relative w-full h-72 rounded-3xl overflow-hidden shadow-map-card ring-1 ring-gray-200 dark:ring-gray-700 group z-0">
                                <MapPicker
                                    latitude={formData.latitude ? parseFloat(formData.latitude) : null}
                                    longitude={formData.longitude ? parseFloat(formData.longitude) : null}
                                    onChange={(lat, lng) => setFormData(prev => ({
                                        ...prev,
                                        latitude: lat.toFixed(6),
                                        longitude: lng.toFixed(6)
                                    }))}
                                />

                                {/* Controls Overlay */}
                                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={getCurrentLocation} className="bg-white dark:bg-card-dark p-2 rounded-xl shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Use Current Location">
                                        <span className="material-symbols-outlined text-xl">my_location</span>
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                                Tap on the map to place the pin at the exact entrance.
                            </p>
                        </div>

                        {/* Lat/Lng Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-text-main dark:text-gray-200">Latitude</label>
                                <input
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-3 text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary transition-all sm:text-sm"
                                    placeholder="0.000000"
                                    type="text"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-text-main dark:text-gray-200">Longitude</label>
                                <input
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-3 text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary transition-all sm:text-sm"
                                    placeholder="0.000000"
                                    type="text"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-text-main dark:text-gray-200">Street Address</label>
                                <div className="relative">
                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 pl-11 text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary transition-all sm:text-sm sm:leading-6 font-medium"
                                        type="text"
                                        placeholder="123 Main St"
                                    />
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">home_pin</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-text-main dark:text-gray-200">City</label>
                                    <input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary transition-all sm:text-sm sm:leading-6 font-medium"
                                        type="text"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-text-main dark:text-gray-200">Zip Code</label>
                                    <input
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-0 bg-white dark:bg-card-dark p-4 text-text-main dark:text-white shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary transition-all sm:text-sm sm:leading-6 font-medium"
                                        type="text"
                                        placeholder="Zip"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-auto">
                            <button
                                onClick={() => isStep2Valid && setStep(3)}
                                disabled={!isStep2Valid}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-glow transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next: Pricing
                                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PRICING */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        {/* Pricing section */}
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">Set Pricing</h2>
                            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-soft mb-4 border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <label className="block text-sm font-bold text-text-main dark:text-white">Base Hourly Rate</label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Suggested: $5.00 - $8.00 / hr</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-lg">payments</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setFormData(prev => ({ ...prev, pricePerHour: Math.max(0, prev.pricePerHour - 0.5) }))} className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-700 text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-600 active:scale-95">
                                        <span className="material-symbols-outlined">remove</span>
                                    </button>
                                    <div className="flex-1 flex justify-center items-center relative h-14">
                                        <span className="text-2xl font-bold text-text-main dark:text-white mr-1">$</span>
                                        <input
                                            name="pricePerHour"
                                            value={formData.pricePerHour}
                                            onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) || 0 }))}
                                            className="w-24 text-center text-4xl font-extrabold bg-transparent border-0 focus:ring-0 p-0 text-text-main dark:text-white outline-none placeholder-gray-300"
                                            step="0.50"
                                            type="number"
                                        />
                                    </div>
                                    <button onClick={() => setFormData(prev => ({ ...prev, pricePerHour: prev.pricePerHour + 0.5 }))} className="h-14 w-14 rounded-2xl bg-primary text-white hover:bg-primary-dark shadow-glow flex items-center justify-center transition-colors active:scale-95 active:shadow-none">
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-card-dark rounded-2xl p-4 pl-5 shadow-soft flex items-center justify-between border border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col">
                                    <label className="block text-sm font-bold text-text-main dark:text-white">Daily Maximum</label>
                                    <span className="text-[10px] text-gray-500 font-medium">Cap price for 24 hours</span>
                                </div>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        name="dailyMaxRate"
                                        value={formData.dailyMaxRate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dailyMaxRate: parseFloat(e.target.value) || 0 }))}
                                        className="w-full rounded-xl border-0 bg-gray-50 dark:bg-gray-800 py-3 pl-7 pr-4 text-right text-text-main dark:text-white font-bold ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Types */}
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">Compatible Vehicle Types</h2>
                            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
                                {[
                                    { id: 'Sedan', icon: 'directions_car' },
                                    { id: 'SUV', icon: 'directions_car' },
                                    { id: 'Truck', icon: 'local_shipping' },
                                    { id: 'Motorcycle', icon: 'two_wheeler' },
                                    { id: 'Van', icon: 'airport_shuttle' }
                                ].map((vehicle) => (
                                    <button
                                        key={vehicle.id}
                                        onClick={() => toggleVehicleType(vehicle.id)}
                                        className={`flex min-w-[100px] flex-col items-center gap-3 rounded-2xl p-4 shadow-soft transition-all active:scale-95 border ${formData.vehicleTypes.includes(vehicle.id)
                                            ? 'bg-primary text-white border-primary shadow-glow'
                                            : 'bg-white dark:bg-card-dark text-gray-400 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-3xl">{vehicle.icon}</span>
                                        <span className="text-xs font-bold tracking-wide">{vehicle.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Availability - Simplified Days Selection */}
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">Availability</h2>
                            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between gap-1 mb-8">
                                    {['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'].map((day, index) => (
                                        <button
                                            key={index}
                                            className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                                                // Simplified: Assuming all selected by default for demo, or match state
                                                formData.daysActive.includes(day)
                                                    ? 'bg-primary text-white shadow-glow'
                                                    : 'bg-gray-100 text-gray-400'
                                                }`}
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    daysActive: prev.daysActive.includes(day)
                                                        ? prev.daysActive.filter(d => d !== day)
                                                        : [...prev.daysActive, day]
                                                }))
                                            }}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[2px] z-10 bg-white dark:bg-card-dark p-1 rounded-full text-gray-300 dark:text-gray-600">
                                        <span className="material-symbols-outlined text-lg">arrow_right_alt</span>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Start Time</label>
                                        <input
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-0 bg-gray-50 dark:bg-gray-800 py-3 pl-3 pr-2 text-center text-text-main dark:text-white font-bold ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary sm:text-sm appearance-none"
                                            type="time"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">End Time</label>
                                        <input
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-0 bg-gray-50 dark:bg-gray-800 py-3 pl-3 pr-2 text-center text-text-main dark:text-white font-bold ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary sm:text-sm appearance-none"
                                            type="time"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-auto">
                            <button
                                onClick={handleSubmit}
                                disabled={!isStep3Valid || loading}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-glow transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
                            >
                                {loading ? 'Creating Spot...' : 'Publish Parking Spot'}
                                {!loading && <span className="material-symbols-outlined text-xl">check_circle</span>}
                            </button>
                        </div>
                    </div>
                )}

            </div>

            <div className="h-8 w-full"></div>
            <BottomNav />
        </div>
    );
}
