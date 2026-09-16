<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    private const ROLES = ['teacher', 'student', 'organization'];

    public function index(string $role): Response
    {
        $role = str()->singular($role);
        abort_unless(in_array($role, self::ROLES, true), 404);
        $users = User::role($role)->latest()->paginate(15)->through(fn (User $user) => [
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'email_verified_at' => $user->email_verified_at?->toISOString(),
            'created_at' => $user->created_at?->toISOString(),
        ]);

        return Inertia::render('users/index', ['users' => $users, 'role' => $role, 'title' => 'Manage '.str()->plural(ucfirst($role))]);
    }

    public function store(Request $request, string $role): RedirectResponse
    {
        $role = str()->singular($role);
        abort_unless(in_array($role, self::ROLES, true), 404);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);
        $user = User::create([...$validated, 'password' => Hash::make($validated['password'])]);
        Role::findOrCreate($role, 'web');
        $user->assignRole($role);

        return to_route('users.index', $role.'s')->with('status', ucfirst($role).' created.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', ['user' => $user->only('id', 'name', 'email')]);
    }
}
