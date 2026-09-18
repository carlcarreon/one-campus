<?php

namespace Database\Seeders;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::findOrCreate('student', 'web');

        $student = User::updateOrCreate(
            ['email' => 'student@onecampus.edu'],
            ['name' => 'Student', 'password' => Hash::make('password')],
        );
        $student->syncRoles([$role]);

        $personalTeam = $student->personalTeam();

        if (! $personalTeam) {
            $name = "Student's Team";
            $slug = $this->uniqueTeamSlug($name);
            $personalTeam = Team::create([
                'name' => $name,
                'slug' => $slug,
                'is_personal' => true,
            ]);
            $personalTeam->memberships()->create([
                'user_id' => $student->id,
                'role' => TeamRole::Owner,
            ]);
            $student->switchTeam($personalTeam);
        } elseif (! $student->isCurrentTeam($personalTeam)) {
            $student->switchTeam($personalTeam);
        }
    }

    private function uniqueTeamSlug(string $name): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $suffix = 1;

        while (Team::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
