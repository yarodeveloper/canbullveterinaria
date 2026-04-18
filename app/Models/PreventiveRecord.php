<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class PreventiveRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pet_id',
        'type',
        'name',
        'application_date',
        'next_due_date',
        'lot_number',
        'brand',
        'weight_at_time',
        'notes',
        'veterinarian_id',
        'branch_id',
        'is_dismissed',
    ];

    protected $casts = [
        'application_date' => 'date',
        'next_due_date' => 'date',
        'weight_at_time' => 'decimal:2',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
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
