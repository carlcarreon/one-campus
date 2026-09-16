<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['model_has_roles', 'model_has_permissions'] as $table) {
            DB::statement("ALTER TABLE {$table} ALTER COLUMN model_id TYPE uuid USING model_id::uuid");
        }
    }

    public function down(): void
    {
        foreach (['model_has_roles', 'model_has_permissions'] as $table) {
            DB::statement("ALTER TABLE {$table} ALTER COLUMN model_id TYPE varchar(255) USING model_id::text");
        }
    }
};
