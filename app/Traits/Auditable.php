<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            $model->audit('created');
        });

        static::updated(function ($model) {
            $model->audit('updated');
        });

        static::deleted(function ($model) {
            $model->audit('deleted');
        });
    }

    protected function audit($event)
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'branch_id' => Auth::user()?->branch_id ?? $this->branch_id ?? null,
            'event' => $event,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->id,
            'old_values' => $event === 'updated' ? array_intersect_key($this->getOriginal(), $this->getDirty()) : null,
            'new_values' => $event !== 'deleted' ? $this->getDirty() : null,
            'url' => request()->fullUrl(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
