<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $originalSuperadminId = $request->session()->get('demo_account.original_user_id');
        $originalSuperadmin = $originalSuperadminId ? User::find($originalSuperadminId) : null;

        if ($originalSuperadminId && (! $originalSuperadmin || ! $originalSuperadmin->hasRole('superadmin'))) {
            $request->session()->forget('demo_account.original_user_id');
            $originalSuperadmin = null;

            if ($user && ! $user->hasRole('superadmin')) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                $user = null;
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'demoAccount' => [
                'isSwitchable' => ($user?->hasRole('superadmin') ?? false) || ($originalSuperadmin !== null && $user?->getKey() !== $originalSuperadmin->getKey()),
                'isSwitched' => $originalSuperadmin !== null && $user?->getKey() !== $originalSuperadmin->getKey(),
                'originalName' => $originalSuperadmin?->name,
                'accounts' => fn () => (($user?->hasRole('superadmin') ?? false) || ($originalSuperadmin !== null && $user?->getKey() !== $originalSuperadmin->getKey()))
                    ? User::query()->whereIn('email', [
                        'admin@onecampus.edu',
                        'user@onecampus.edu',
                        'teacher@onecampus.edu',
                        'org@onecampus.edu',
                        'student@onecampus.edu',
                    ])->orderBy('name')->get(['id', 'name', 'email'])
                    : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
        ];
    }
}
