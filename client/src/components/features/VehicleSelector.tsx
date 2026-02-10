"use client";

import React, { useEffect, useState } from 'react';

interface Vehicle {
    _id: string;
    make: string;
    model: string;
    year: string;
    plate: string;
}

interface VehicleSelectorProps {
    onVehicleChange: (details: { make: string; model: string; year: string; plate?: string }) => void;
    showPlate?: boolean;
    initialValues?: { make: string; model: string; year: string; plate?: string };
}

export function VehicleSelector({ onVehicleChange, showPlate = false, initialValues }: VehicleSelectorProps) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [form, setForm] = useState({
        make: initialValues?.make || '',
        model: initialValues?.model || '',
        year: initialValues?.year || '',
        plate: initialValues?.plate || ''
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('https://mechaniclk-devthon-production.up.railway.app/api/vehicles', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) setVehicles(data);
            } catch { /* ignore */ }
        };
        fetchVehicles();
    }, []);

    useEffect(() => {
        onVehicleChange(form);
    }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

    const applyVehicle = (vehicle: Vehicle | null) => {
        if (!vehicle) return;
        const newForm = {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            plate: vehicle.plate || ''
        };
        setForm(newForm);
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-sub mb-2">Saved Vehicle</label>
                <select
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                    value={selectedVehicleId}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSelectedVehicleId(value);
                        const selected = vehicles.find((v) => v._id === value) || null;
                        applyVehicle(selected);
                    }}
                >
                    <option value="">Choose from garage (optional)</option>
                    {vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                        </option>
                    ))}
                </select>
            </div>
            <div className={`grid ${showPlate ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
                <input
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                    placeholder="Make"
                    value={form.make}
                    onChange={(e) => setForm({ ...form, make: e.target.value })}
                />
                <input
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                    placeholder="Model"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
                <input
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                    placeholder="Year"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
                {showPlate && (
                    <input
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                        placeholder="Plate"
                        value={form.plate}
                        onChange={(e) => setForm({ ...form, plate: e.target.value })}
                    />
                )}
            </div>
        </div>
    );
}
