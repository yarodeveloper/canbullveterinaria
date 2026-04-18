<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroomingStyle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'branch_id',
        'is_active'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
