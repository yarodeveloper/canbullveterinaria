<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_id',
        'product_id',
        'concept',
        'quantity',
        'unit_price',
        'subtotal',
        'tax',
        'tax_iva',
        'tax_ieps',
        'total',
        'type',
        'assigned_user_id',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function receipt()
    {
        return $this->belongsTo(Receipt::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }
}
