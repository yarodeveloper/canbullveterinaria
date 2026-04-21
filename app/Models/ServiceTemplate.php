<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceTemplate extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory, \Illuminate\Database\Eloquent\SoftDeletes, \App\Traits\Auditable;

    protected $fillable = [
        'name',
        'description',
        'animal_type',
        'total_estimated',
        'is_active',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    public function items()
    {
        return $this->hasMany(ServiceTemplateItem::class);
    }
}
