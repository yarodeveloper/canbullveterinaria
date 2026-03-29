<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Euthanasia extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'folio',
        'pet_id',
        'veterinarian_id',
        'branch_id',
        'performed_at',
        'status',
        'weight',
        'reason',
        'reason_detail',
        'medications',
        'owner_present',
        'owner_authorization',
        'consent_signed',
        'owner_name_override',
        'disposition',
        'cremation_provider',
        'notes',
    ];

    protected $casts = [
        'performed_at'   => 'datetime',
        'medications'    => 'array',
        'owner_present'  => 'boolean',
        'consent_signed' => 'boolean',
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

    // Genera folio interno secuencial si no se proporciona
    public static function generateFolio(): string
    {
        $year  = date('Y');
        $count = self::whereYear('created_at', $year)->withTrashed()->count() + 1;
        return 'EUT-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
