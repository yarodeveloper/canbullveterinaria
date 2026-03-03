<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class HospitalizationMonitoring extends Model
{
    use Auditable;

    protected $fillable = [
        'hospitalization_id',
        'user_id',
        'temperature',
        'heart_rate',
        'respiratory_rate',
        'mucosa_color',
        'capillary_refill_time',
        'blood_pressure',
        'hydration_status',
        'pain_score',
        'mental_state',
        'medication_administered',
        'food_intake',
        'urination',
        'defecation',
        'notes',
    ];

    public function hospitalization()
    {
        return $this->belongsTo(Hospitalization::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
