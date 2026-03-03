<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Pet;
use App\Models\User;

class PetDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'uploaded_by',
        'name',
        'file_path',
        'mime_type',
        'size',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
