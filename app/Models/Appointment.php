<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'pet_id',
        'user_id',
        'veterinarian_id',
        'branch_id',
        'start_time',
        'end_time',
        'type',
        'status',
        'reason',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function veterinarian()
    {
        return $this->belongsTo(User::class, 'veterinarian_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
