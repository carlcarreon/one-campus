<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        Role::findOrCreate('student', 'web');
    }

    public function down(): void
    {
        Role::where('name', 'student')->where('guard_name', 'web')->delete();
    }
};
