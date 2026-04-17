<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroomingOrder extends Model
{
    /** @use HasFactory<\Database\Factories\GroomingOrderFactory> */
    use HasFactory;

    protected $fillable = [
        'folio',
        'branch_id',
        'client_id',
        'pet_id',
        'user_id',
        'status',
        'arrival_condition',
        'notes',
        'next_visit_date',
        'paid'
    ];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function client() { return $this->belongsTo(User::class, 'client_id'); }
    public function pet() { return $this->belongsTo(Pet::class); }
    public function user() { return $this->belongsTo(User::class, 'user_id'); }
    public function items() { return $this->hasMany(GroomingOrderItem::class); }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            if (!$order->folio) {
                do {
                    $folio = 'GRM-' . date('ymd') . '-' . strtoupper(substr(uniqid(), -4));
                } while (self::where('folio', $folio)->exists());
                $order->folio = $folio;
            }
        });
    }
}
