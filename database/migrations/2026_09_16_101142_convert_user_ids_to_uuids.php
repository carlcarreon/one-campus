<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fresh installations already have UUID user keys.
        if (DB::getDriverName() !== 'pgsql' || Schema::getColumnType('users', 'id') === 'uuid') {
            return;
        }

        DB::statement('LOCK TABLE users, sessions, passkeys, team_members, team_invitations, model_has_roles, model_has_permissions IN ACCESS EXCLUSIVE MODE');
        DB::statement('CREATE TEMP TABLE user_uuid_map ON COMMIT DROP AS SELECT id, gen_random_uuid() AS uuid FROM users');
        DB::statement('CREATE UNIQUE INDEX ON user_uuid_map (id)');
        DB::unprepared(<<<'SQL'
            CREATE FUNCTION pg_temp.user_uuid(old_id bigint) RETURNS uuid
            LANGUAGE SQL STABLE AS 'SELECT uuid FROM user_uuid_map WHERE id = old_id'
            SQL);

        $references = [
            'passkeys' => 'user_id',
            'team_members' => 'user_id',
            'team_invitations' => 'invited_by',
        ];

        foreach ($references as $table => $column) {
            DB::statement("ALTER TABLE {$table} DROP CONSTRAINT {$table}_{$column}_foreign");
        }

        DB::statement('ALTER TABLE users ALTER COLUMN id DROP DEFAULT');
        DB::statement('ALTER TABLE users ALTER COLUMN id TYPE uuid USING pg_temp.user_uuid(id)');

        foreach ([...$references, 'sessions' => 'user_id'] as $table => $column) {
            DB::statement("ALTER TABLE {$table} ALTER COLUMN {$column} TYPE uuid USING pg_temp.user_uuid({$column})");
        }

        foreach ($references as $table => $column) {
            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT {$table}_{$column}_foreign FOREIGN KEY ({$column}) REFERENCES users(id) ON DELETE CASCADE");
        }

        // Polymorphic permission keys must also support models with integer IDs.
        foreach (['model_has_roles', 'model_has_permissions'] as $table) {
            DB::statement("ALTER TABLE {$table} ALTER COLUMN model_id TYPE varchar(255) USING model_id::text");
            DB::update("UPDATE {$table} AS pivot SET model_id = mapping.uuid::text FROM user_uuid_map AS mapping WHERE pivot.model_id = mapping.id::text AND pivot.model_type = ?", ['App\\Models\\User']);
        }

        DB::statement('DROP FUNCTION pg_temp.user_uuid(bigint)');
    }

    public function down(): void
    {
        throw new RuntimeException('User UUID conversion requires a database backup to reverse.');
    }
};
