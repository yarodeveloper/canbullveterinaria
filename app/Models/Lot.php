<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lot extends Model
{
    use HasFactory, SoftDeletes, Auditable;

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
        'branch_id',
        'lot_number',
        'expiration_date',
        'initial_quantity',
        'current_quantity',
        'status',
        'unit_cost',
        'provider',
    ];

    protected $casts = [
        'expiration_date' => 'date',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
