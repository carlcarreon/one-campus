<?php

use App\Models\User;
use Database\Seeders\StudentSeeder;

test('student seeder creates a student demo account with a personal team', function () {
    $this->seed(StudentSeeder::class);

    $student = User::where('email', 'student@onecampus.edu')->firstOrFail();
    $personalTeam = $student->personalTeam();

    expect($student->hasRole('student'))->toBeTrue();
    expect($personalTeam)->not->toBeNull();
    expect($student->current_team_id)->toBe($personalTeam->id);
    expect($personalTeam->members()->whereKey($student->id)->wherePivot('role', 'owner')->exists())->toBeTrue();
});

test('student seeder can be run repeatedly without creating duplicate accounts or teams', function () {
    $this->seed(StudentSeeder::class);
    $this->seed(StudentSeeder::class);

    $student = User::where('email', 'student@onecampus.edu')->firstOrFail();

    expect(User::where('email', 'student@onecampus.edu')->count())->toBe(1);
    expect($student->ownedTeams()->where('is_personal', true)->count())->toBe(1);
});
