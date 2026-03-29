<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalRecord extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'pet_id',
        'user_id',
        'branch_id',
        'type',
        'subjective',
        'anamnesis',
        'objective',
        'assessment',
        'plan',
        'vital_signs',
        'physical_state',
        'created_at',
        'medications',
        'applied_medications',
    ];

    protected $casts = [
        'vital_signs' => 'json',
        'anamnesis' => 'json',
        'physical_state' => 'json',
        'medications' => 'json',
        'applied_medications' => 'json',
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

    public function attachments()
    {
        return $this->hasMany(MedicalRecordAttachment::class);
    }
}
