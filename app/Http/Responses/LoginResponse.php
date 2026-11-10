<?php

namespace App\Http\Responses;

use App\Http\Responses\Concerns\RedirectsToCurrentTeam;
use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    use RedirectsToCurrentTeam;

    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false], 200);
        }

        $user = $request->user();

        // Only admin, superadmin, and org can access the dashboard.
        if (!in_array($user->role, ['admin', 'superadmin', 'org'], true)) {
            return redirect()->route('feed.index');
        }

        return redirect()->intended(
            $this->redirectPathForCurrentTeam(
                $request,
                Fortify::redirects('login')
            )
        );
    }
}