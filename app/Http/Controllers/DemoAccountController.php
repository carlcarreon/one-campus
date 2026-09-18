<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DemoAccountController extends Controller
{
    /**
     * Switch the current superadmin session to a seeded demo account.
     */
    public function switch(Request $request, User $user): RedirectResponse
    {
        abort_unless($this->isDemoAccount($user), 404);

        $originalUserId = $request->session()->get('demo_account.original_user_id');
        if (! $originalUserId) {
            abort_unless($request->user()->hasRole('superadmin'), 403);
            $originalUserId = $request->user()->getKey();
        } else {
            $originalUser = User::find($originalUserId);
            abort_unless($originalUser && $originalUser->hasRole('superadmin'), 403);
        }

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put('demo_account.original_user_id', $originalUserId);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Switched to :name demo account.', ['name' => $user->name])]);

        return $this->dashboardRedirect($user);
    }

    /**
     * Return from a demo account to the original superadmin session.
     */
    public function return(Request $request): RedirectResponse
    {
        abort_if($request->user()->hasRole('superadmin'), 403);

        $originalUserId = $request->session()->get('demo_account.original_user_id');
        $originalUser = $originalUserId ? User::find($originalUserId) : null;

        if (! $originalUser || ! $originalUser->hasRole('superadmin')) {
            $request->session()->forget('demo_account.original_user_id');
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login');
        }

        $request->session()->forget('demo_account.original_user_id');
        Auth::login($originalUser);
        $request->session()->regenerate();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Returned to Superadmin.')]);

        return $this->dashboardRedirect($originalUser);
    }

    /**
     * Determine whether the user is one of the seeded demo accounts.
     */
    private function isDemoAccount(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'user', 'teacher', 'organization'])
            && in_array($user->email, [
                'admin@onecampus.edu',
                'user@onecampus.edu',
                'teacher@onecampus.edu',
                'org@onecampus.edu',
            ], true);
    }

    /**
     * Redirect to the user's current team dashboard, or their teams page if none is set.
     */
    private function dashboardRedirect(User $user): RedirectResponse
    {
        $team = $user->currentTeam;

        return $team
            ? redirect()->route('dashboard', ['current_team' => $team->slug])
            : redirect()->route('teams.index');
    }
}
