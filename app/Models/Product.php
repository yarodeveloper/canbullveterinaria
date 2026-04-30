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
        'discount_percent',
        'discount_start_date',
        'discount_end_date',
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

    protected $appends = ['selling_price', 'base_price', 'has_active_discount', 'discounted_price'];

    /**
     * El 'price' en la base de datos ahora representa el PRECIO FINAL AL PÚBLICO.
     */
    public function getSellingPriceAttribute()
    {
        return (float) $this->price;
    }

    /**
     * Calcula la base gravable a partir del precio final (Desglose Inverso).
     */
    public function getBasePriceAttribute()
    {
        $final = (float) $this->price;
        $ieps = (float) $this->tax_ieps;
        $iva = (float) $this->tax_iva;
        
        // Formula Inversa: Base = Total / ((1 + IEPS/100) * (1 + IVA/100))
        $divisor = (1 + $ieps / 100) * (1 + $iva / 100);
        return $divisor > 0 ? $final / $divisor : $final;
    }

    public function getHasActiveDiscountAttribute()
    {
        $percent = (float) ($this->discount_percent ?? 0);
        if ($percent <= 0) return false;
        
        $today = date('Y-m-d');
        $start = $this->discount_start_date; // Ya viene como YYYY-MM-DD
        $end = $this->discount_end_date;

        // Validaciones simples de fecha (string comparison es segura para YYYY-MM-DD)
        if ($start && $today < $start) return false;
        if ($end && $today > $end) return false;

        return true;
    }

    public function getDiscountedPriceAttribute()
    {
        if (!$this->has_active_discount) return (float) $this->price;
        
        $discount = (float) $this->price * ($this->discount_percent / 100);
        return max(0, (float) $this->price - $discount);
    }

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
