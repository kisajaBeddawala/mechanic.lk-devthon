"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
);
const MarkerDynamic = dynamic(
    () => import('react-leaflet').then(mod => mod.Marker),
    { ssr: false }
);
const PopupDynamic = dynamic(
    () => import('react-leaflet').then(mod => mod.Popup),
    { ssr: false }
);

interface Spot {
    _id: string;
    title: string;
    pricePerHour: number;
    location: {
        coordinates: [number, number];
        address?: string;
    };
}

interface ParkingMapProps {
    spots?: Spot[];
    center?: [number, number];
    onSpotSelect?: (spot: Spot) => void;
}

export function ParkingMap({ spots = [], center = [6.9271, 79.8612], onSpotSelect }: ParkingMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="relative h-full w-full bg-gray-200 dark:bg-gray-800 overflow-hidden rounded-3xl flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full overflow-hidden rounded-3xl">
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
            <MapContainer
                center={center}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {spots.map((spot) => (
                    <MarkerDynamic
                        key={spot._id}
                        position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
                        eventHandlers={{
                            click: () => onSpotSelect?.(spot),
                        }}
                    >
                        <PopupDynamic>
                            <div className="text-sm">
                                <p className="font-bold">{spot.title}</p>
                                <p>LKR {spot.pricePerHour}/hr</p>
                            </div>
                        </PopupDynamic>
                    </MarkerDynamic>
                ))}
            </MapContainer>
        </div>
    );
}
