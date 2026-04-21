<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory, \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'folio',
        'pet_id',
        'client_id',
        'branch_id',
        'user_id',
        'status',
        'weight_at_time',
        'subtotal',
        'tax',
        'total',
        'valid_until',
        'notes',
        'guest_client_name',
        'guest_pet_name',
        'guest_species',
    ];

    protected $casts = [
        'valid_until' => 'date',
        'weight_at_time' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items()
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function pendingCharges()
    {
        return $this->hasMany(PendingCharge::class, 'source_quote_id');
    }

    public static function generateFolio(): string
    {
        $year  = date('Y');
        $count = self::whereYear('created_at', $year)->withTrashed()->count() + 1;
        return 'COT-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
