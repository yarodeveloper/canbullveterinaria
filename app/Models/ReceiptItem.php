<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_id',
        'concept',
        'quantity',
        'unit_price',
        'subtotal',
        'tax',
        'total',
        'type',
    ];

    public function receipt()
    {
        return $this->belongsTo(Receipt::class);
    }
}
