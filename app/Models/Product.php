<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'product_category_id',
        'name',
        'sku',
        'barcode',
        'description',
        'unit',
        'min_stock',
        'price',
        'tax_iva',
        'tax_ieps',
        'is_controlled',
        'is_active',
        'is_service',
    ];

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    public function lots()
    {
        return $this->hasMany(Lot::class);
    }

    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function currentStock($branchId)
    {
        return $this->lots()->where('branch_id', $branchId)->where('status', 'active')->sum('current_quantity');
    }
}
