<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Hospitalization extends Model
{
    use Auditable;

    protected $fillable = [
        'pet_id',
        'user_id',
        'branch_id',
        'reason',
        'status',
        'admission_date',
        'discharge_date',
        'initial_weight',
        'discharge_notes',
    ];

    protected $casts = [
        'admission_date' => 'datetime',
        'discharge_date' => 'datetime',
        'initial_weight' => 'float',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function veterinarian()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function monitorings()
    {
        return $this->hasMany(HospitalizationMonitoring::class);
    }
}
