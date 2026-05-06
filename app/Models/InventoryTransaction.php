<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->branch_id)) {
                $model->branch_id = auth()->user()->branch_id ?? \App\Models\Branch::first()?->id;
            }
        });
    }

    protected $fillable = [
        'product_id',
        'lot_id',
        'branch_id',
        'user_id',
        'type',
        'quantity',
        'notes',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
