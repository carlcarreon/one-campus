<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $permission = Permission::findOrCreate('manage-users', 'web');
        Role::findOrCreate('admin', 'web')->givePermissionTo($permission);
    }

    public function down(): void
    {
        $permission = Permission::where('name', 'manage-users')->where('guard_name', 'web')->first();
        $permission?->delete();
        Role::where('name', 'admin')->where('guard_name', 'web')->delete();
    }
};
