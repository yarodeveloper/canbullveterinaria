import React from 'react';

export default function PetAvatar({ pet, className = "w-20 h-20" }) {
    if (!pet) return null;

    let photo = null;
    if (pet.photo_path) {
        if (pet.photo_path.startsWith('http')) {
            photo = pet.photo_path;
        } else if (pet.photo_path.startsWith('/')) {
            photo = pet.photo_path;
        } else {
            photo = `/storage/${pet.photo_path}`;
        }
    }

    const getSpeciesIcon = (species) => {
        const s = species?.toLowerCase() || '';
        if (s.includes('perro') || s.includes('canino') || s.includes('dog')) return '🐶';
        if (s.includes('gato') || s.includes('felino') || s.includes('cat')) return '🐱';
        if (s.includes('ave') || s.includes('pajaro') || s.includes('bird')) return '🦜';
        if (s.includes('conejo') || s.includes('rabbit')) return '🐰';
        return '🐾';
    };

    return (
        <div className={`${className} rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 border dark:border-gray-700 shrink-0`}>
            {photo ? (
                <img 
                    src={photo} 
                    alt={pet.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            <div 
                className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900"
                style={{ display: photo ? 'none' : 'flex' }}
            >
                {getSpeciesIcon(pet.species)}
            </div>
        </div>
    );
}
