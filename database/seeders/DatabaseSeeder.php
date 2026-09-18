<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $manageUsers = Permission::findOrCreate('manage-users', 'web');

        $accounts = [
            ['name' => 'Admin', 'email' => 'admin@onecampus.edu', 'role' => 'admin'],
            ['name' => 'User', 'email' => 'user@onecampus.edu', 'role' => 'user'],
            ['name' => 'Superadmin', 'email' => 'superadmin@onecampus.edu', 'role' => 'superadmin'],
            ['name' => 'Teacher', 'email' => 'teacher@onecampus.edu', 'role' => 'teacher'],
            ['name' => 'Organization', 'email' => 'org@onecampus.edu', 'role' => 'organization'],
        ];

        foreach ($accounts as $account) {
            $role = Role::findOrCreate($account['role'], 'web');
            if (in_array($account['role'], ['admin', 'superadmin'], true)) {
                $role->givePermissionTo($manageUsers);
            }

            $user = User::updateOrCreate(
                ['email' => $account['email']],
                ['name' => $account['name'], 'password' => Hash::make('password')],
            );
            $user->syncRoles([$role]);
        }

        $this->call(StudentSeeder::class);
    }
}
