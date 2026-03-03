import React from 'react';

export default function PetAvatar({ pet, className = "w-20 h-20" }) {
    const photo = pet.photo_path ? `/storage/${pet.photo_path}` : null;
    const species = (pet.species || '').toLowerCase();

    // Fallback cute avatars based on species
    const avatars = {
        canino: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', // Cute Dog
        felino: 'https://cdn-icons-png.flaticon.com/512/616/616430.png', // Cute Cat
        otros: 'https://cdn-icons-png.flaticon.com/512/616/616611.png',  // Cute Rabbit/General
    };

    const defaultAvatar = avatars[species] || avatars.otros;

    return (
        <div className={`${className} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center`}>
            {photo ? (
                <img src={photo} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
                <img src={defaultAvatar} alt="Default Avatar" className="w-4/5 h-4/5 object-contain opacity-80" />
            )}
        </div>
    );
}
