<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

function createDemoAccount(string $name, string $email, string $role): User
{
    Role::findOrCreate($role, 'web');

    $user = User::factory()->create(['name' => $name, 'email' => $email]);
    $user->assignRole($role);

    return $user;
}

test('superadmins can switch into each seeded demo account and return to their account', function () {
    $superadmin = createDemoAccount('Superadmin', 'superadmin@onecampus.edu', 'superadmin');
    $targets = [
        createDemoAccount('Admin', 'admin@onecampus.edu', 'admin'),
        createDemoAccount('User', 'user@onecampus.edu', 'user'),
        createDemoAccount('Teacher', 'teacher@onecampus.edu', 'teacher'),
        createDemoAccount('Organization', 'org@onecampus.edu', 'organization'),
        createDemoAccount('Student', 'student@onecampus.edu', 'student'),
    ];

    foreach ($targets as $target) {
        $this->actingAs($superadmin)
            ->post(route('demo-accounts.switch', $target))
            ->assertRedirect(route('home'));

        expect(auth()->id())->toBe($target->id);
        expect(session('demo_account.original_user_id'))->toBe($superadmin->id);

        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.id', $target->id)
            ->where('demoAccount.isSwitched', true)
            ->where('demoAccount.originalName', 'Superadmin'),
        );

        $this->post(route('demo-accounts.return'))->assertRedirect(route('home'));
        expect(auth()->id())->toBe($superadmin->id);
        expect(session()->has('demo_account.original_user_id'))->toBeFalse();
    }
});

test('non-superadmins cannot switch demo accounts or return from a demo session', function () {
    $user = createDemoAccount('User', 'user@onecampus.edu', 'user');
    $target = createDemoAccount('Teacher', 'teacher@onecampus.edu', 'teacher');

    $this->actingAs($user)
        ->post(route('demo-accounts.switch', $target))
        ->assertForbidden();

    $this->post(route('demo-accounts.return'))->assertForbidden();
});

test('superadmins cannot switch into users outside the seeded demo accounts', function () {
    $superadmin = createDemoAccount('Superadmin', 'superadmin@onecampus.edu', 'superadmin');
    $otherUser = createDemoAccount('Another Admin', 'another-admin@example.com', 'admin');

    $this->actingAs($superadmin)
        ->post(route('demo-accounts.switch', $otherUser))
        ->assertNotFound();
});

test('logging out while switched clears the original account marker', function () {
    $superadmin = createDemoAccount('Superadmin', 'superadmin@onecampus.edu', 'superadmin');
    $demoUser = createDemoAccount('Teacher', 'teacher@onecampus.edu', 'teacher');

    $this->actingAs($demoUser)
        ->withSession(['demo_account.original_user_id' => $superadmin->id])
        ->post(route('logout'))
        ->assertRedirect('/');

    expect(session()->has('demo_account.original_user_id'))->toBeFalse();
});
