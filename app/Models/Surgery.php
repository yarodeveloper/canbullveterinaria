<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Surgery extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'pet_id',
        'branch_id',
        'appointment_id',
        'veterinarian_id',
        'anesthesiologist_id',
        'surgery_type',
        'status',
        'asa_classification',
        'scheduled_at',
        'start_time',
        'end_time',
        'pre_op_notes',
        'intra_op_notes',
        'post_op_notes',
        'checklist',
        'vital_signs',
        'post_vital_signs',
        'pre_operative_medications',
        'intra_operative_medications',
        'post_operative_medications',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'checklist' => 'array',
        'vital_signs' => 'array',
        'post_vital_signs' => 'array',
        'pre_operative_medications' => 'array',
        'intra_operative_medications' => 'array',
        'post_operative_medications' => 'array',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function leadSurgeon()
    {
        return $this->belongsTo(User::class, 'veterinarian_id');
    }

    public function anesthesiologist()
    {
        return $this->belongsTo(User::class, 'anesthesiologist_id');
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
