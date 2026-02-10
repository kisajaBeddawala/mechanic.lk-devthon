"use client";

interface ParkingCardProps {
    title: string;
    description: string;
    pricePerHour: number;
    distance?: string;
    vehicleTypes?: string[];
    onBook: () => void;
}

export function ParkingCard({ title, description, pricePerHour, distance, vehicleTypes, onBook }: ParkingCardProps) {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-card-dark rounded-2xl p-4 border border-transparent hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-text-main dark:text-white leading-tight">{title}</h3>
                    <p className="text-sm text-text-sub dark:text-gray-400 mt-1 line-clamp-1">{description}</p>
                </div>
                {distance && (
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-[16px] text-primary">near_me</span>
                        <span className="text-xs font-bold text-primary">{distance}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4 mt-2">
                {vehicleTypes?.map(type => (
                    <span key={type} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-text-sub dark:text-gray-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                            {type === 'Sedan' ? 'directions_car' :
                                type === 'SUV' ? 'directions_car' :
                                    type === 'Truck' ? 'local_shipping' :
                                        type === 'Motorcycle' ? 'two_wheeler' : 'airport_shuttle'}
                        </span>
                        {type}
                    </span>
                ))}
            </div>

            <div className="mt-auto flex items-end justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                <div>
                    <span className="text-2xl font-black text-primary">LKR {pricePerHour}</span>
                    <span className="text-xs text-text-sub font-medium ml-1">/ hr</span>
                </div>
                <button
                    onClick={onBook}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-glow hover:bg-primary/90 transition-all active:scale-95"
                >
                    Reserve
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
