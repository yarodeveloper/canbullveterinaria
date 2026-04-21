<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceTemplateItem extends Model
{
    protected $fillable = [
        'service_template_id',
        'product_id',
        'category',
        'description',
        'is_dosable',
        'base_dose',
        'unit_weight',
        'suggested_quantity',
        'suggested_price',
    ];

    protected $casts = [
        'is_dosable' => 'boolean',
        'base_dose' => 'decimal:4',
        'unit_weight' => 'decimal:2',
        'suggested_quantity' => 'decimal:2',
        'suggested_price' => 'decimal:2',
    ];

    public function template()
    {
        return $this->belongsTo(ServiceTemplate::class, 'service_template_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
