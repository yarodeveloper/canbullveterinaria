<?php

$branch = \App\Models\Branch::firstOrCreate(
    ['id' => 1],
    [
        'name' => 'CanBull Matriz',
        'address' => 'Av. Principal 123',
        'phone' => '555-0192',
        'email' => 'matriz@canbull.com',
        'tax_id' => 'CANB123456XYZ',
    ]
);

\App\Models\User::query()->update(['branch_id' => $branch->id]);

echo "Fixed branch_id for users.\n";
