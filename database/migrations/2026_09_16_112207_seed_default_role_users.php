<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $permissionId = DB::table('permissions')
            ->where('name', 'manage-users')
            ->where('guard_name', 'web')
            ->value('id');

        $accounts = [
            ['name' => 'Admin', 'email' => 'admin@onecampus.edu', 'role' => 'admin'],
            ['name' => 'User', 'email' => 'user@onecampus.edu', 'role' => 'user'],
            ['name' => 'Superadmin', 'email' => 'superadmin@onecampus.edu', 'role' => 'superadmin'],
            ['name' => 'Teacher', 'email' => 'teacher@onecampus.edu', 'role' => 'teacher'],
            ['name' => 'Organization', 'email' => 'org@onecampus.edu', 'role' => 'organization'],
        ];

        foreach ($accounts as $account) {
            $roleId = DB::table('roles')->where('name', $account['role'])->where('guard_name', 'web')->value('id');
            if ($roleId === null) {
                $roleId = DB::table('roles')->insertGetId([
                    'name' => $account['role'], 'guard_name' => 'web',
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }

            $user = DB::table('users')->where('email', $account['email'])->first();
            $userId = $user?->id;
            if ($userId === null) {
                $userId = (string) Str::uuid();
                DB::table('users')->insert([
                    'id' => $userId, 'name' => $account['name'], 'email' => $account['email'],
                    'password' => Hash::make('password'), 'created_at' => now(), 'updated_at' => now(),
                ]);
            }

            DB::table('model_has_roles')->updateOrInsert(
                ['role_id' => $roleId, 'model_id' => $userId, 'model_type' => 'App\\Models\\User'],
                [],
            );

            if ($permissionId !== null && in_array($account['role'], ['admin', 'superadmin'], true)) {
                DB::table('role_has_permissions')->updateOrInsert(
                    ['permission_id' => $permissionId, 'role_id' => $roleId],
                    [],
                );
            }
        }
    }

    public function down(): void
    {
        $emails = [
            'admin@onecampus.edu', 'user@onecampus.edu', 'superadmin@onecampus.edu',
            'teacher@onecampus.edu', 'org@onecampus.edu',
        ];
        $userIds = DB::table('users')->whereIn('email', $emails)->pluck('id');
        DB::table('model_has_roles')->whereIn('model_id', $userIds)->where('model_type', 'App\\Models\\User')->delete();
        DB::table('users')->whereIn('id', $userIds)->delete();
    }
};
