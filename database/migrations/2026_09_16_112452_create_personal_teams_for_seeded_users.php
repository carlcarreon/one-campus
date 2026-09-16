<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $emails = [
            'admin@onecampus.edu', 'user@onecampus.edu', 'superadmin@onecampus.edu',
            'teacher@onecampus.edu', 'org@onecampus.edu',
        ];

        foreach (DB::table('users')->whereIn('email', $emails)->get(['id', 'name', 'current_team_id']) as $user) {
            if ($user->current_team_id !== null) {
                continue;
            }

            $slug = Str::slug($user->name).'-'.Str::lower(Str::random(6));
            $teamId = DB::table('teams')->insertGetId([
                'name' => $user->name."'s Team",
                'slug' => $slug,
                'is_personal' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('team_members')->insert([
                'team_id' => $teamId,
                'user_id' => $user->id,
                'role' => 'owner',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('users')->where('id', $user->id)->update(['current_team_id' => $teamId]);
        }
    }

    public function down(): void
    {
        $emails = [
            'admin@onecampus.edu', 'user@onecampus.edu', 'superadmin@onecampus.edu',
            'teacher@onecampus.edu', 'org@onecampus.edu',
        ];
        $teamIds = DB::table('teams')->where('is_personal', true)->whereIn('name', ["Admin's Team", "User's Team", "Superadmin's Team", "Teacher's Team", "Organization's Team"])->pluck('id');
        DB::table('users')->whereIn('email', $emails)->whereIn('current_team_id', $teamIds)->update(['current_team_id' => null]);
        DB::table('team_members')->whereIn('team_id', $teamIds)->delete();
        DB::table('teams')->whereIn('id', $teamIds)->delete();
    }
};
