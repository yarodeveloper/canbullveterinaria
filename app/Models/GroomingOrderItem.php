<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroomingOrderItem extends Model
{
    protected $fillable = [
        'grooming_order_id',
        'product_id',
        'concept',
        'unit_price',
        'quantity'
    ];

    public function product() { return $this->belongsTo(Product::class); }
}
