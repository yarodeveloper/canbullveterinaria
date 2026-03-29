<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, \App\Traits\Auditable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'branch_id',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'tax_id',
        'crm_notes',
        'behavior_profile',
        'professional_license',
    ];

    public function pets()
    {
        return $this->belongsToMany(Pet::class)->withPivot('relation_type', 'is_primary')->withTimestamps();
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isVeterinarian()
    {
        return $this->role === 'veterinarian';
    }

    public function isReceptionist()
    {
        return $this->role === 'receptionist';
    }

    public function isClient()
    {
        return $this->role === 'client';
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
