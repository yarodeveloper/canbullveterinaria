<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingCharge extends Model
{
    protected $fillable = [
        'source_quote_id', 'branch_id', 'client_id', 'pet_id', 'product_id', 'description', 'quantity', 'price', 'assigned_user_id', 'status', 'notes'
    ];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function client() { return $this->belongsTo(User::class, 'client_id'); }
    public function pet() { return $this->belongsTo(Pet::class); }
    public function product() { return $this->belongsTo(Product::class); }
    public function quote() { return $this->belongsTo(Quote::class, 'source_quote_id'); }
    public function assignedUser() { return $this->belongsTo(User::class, 'assigned_user_id'); }
}
