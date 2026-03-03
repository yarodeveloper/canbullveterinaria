<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consent extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'pet_id',
        'user_id',
        'branch_id',
        'type',
        'status',
        'content',
        'digital_signature',
        'signed_at',
        'signed_by_name',
        'signed_by_id_number',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
