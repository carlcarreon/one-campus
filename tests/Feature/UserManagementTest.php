<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

test('guests cannot access user management', function () {
    $this->get(route('users.index', 'teachers'))->assertRedirect(route('login'));
});

test('authenticated users can view paginated users', function () {
    $user = User::factory()->create(['name' => 'Jane User']);
    Role::findOrCreate('admin', 'web')->givePermissionTo('manage-users');
    Role::findOrCreate('teacher', 'web');
    $user->assignRole('admin');
    Role::findOrCreate('teacher', 'web');
    $teacher = User::factory()->create(['name' => 'Jane User']);
    $teacher->assignRole('teacher');

    $response = $this->actingAs($user)->get(route('users.index', 'teachers'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('users/index')
        ->has('users.data')
        ->where('users.data.0.name', 'Jane User'),
    );
});

test('authenticated users can open the user edit placeholder', function () {
    $user = User::factory()->create();
    Role::findOrCreate('admin', 'web')->givePermissionTo('manage-users');
    $user->assignRole('admin');
    Role::findOrCreate('teacher', 'web');
    $teacher = User::factory()->create(['name' => 'Jane User']);
    $teacher->assignRole('teacher');

    $response = $this->actingAs($user)->get(route('users.edit', $user));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('users/edit')
        ->where('user.id', $user->id)
        ->where('user.email', $user->email),
    );
});
