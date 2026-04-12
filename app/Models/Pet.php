<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pet extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    protected $fillable = [
        'uuid',
        'photo_path',
        'name',
        'species',
        'breed',
        'gender',
        'dob',
        'color',
        'microchip',
        'weight',
        'notes',
        'user_id',
        'branch_id',
        'is_aggressive',
        'is_sterilized',
        'allergies',
        'chronic_conditions',
        'status',
        'death_date',
        'death_reason',
    ];

    protected $casts = [
        'dob' => 'date',
        'death_date' => 'date',
        'weight' => 'decimal:2',
        'is_aggressive' => 'boolean',
        'is_sterilized' => 'boolean',
    ];

    public function owners()
    {
        return $this->belongsToMany(User::class)->withPivot('relation_type', 'is_primary')->withTimestamps();
    }

    public function owner()
    {
        // For compatibility with existing code, returns the first primary owner or the first owner found
        return $this->belongsTo(User::class, 'user_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function consents()
    {
        return $this->hasMany(Consent::class);
    }

    public function preventiveRecords()
    {
        return $this->hasMany(PreventiveRecord::class);
    }

    public function surgeries()
    {
        return $this->hasMany(Surgery::class);
    }

    public function hospitalizations()
    {
        return $this->hasMany(Hospitalization::class);
    }

    public function documents()
    {
        return $this->hasMany(PetDocument::class);
    }

    public function groomingOrders()
    {
        return $this->hasMany(GroomingOrder::class);
    }
}
