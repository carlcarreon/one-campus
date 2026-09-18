<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoAccountController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VotingController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('demo-accounts/{user}/switch', [DemoAccountController::class, 'switch'])->name('demo-accounts.switch');
    Route::post('demo-accounts/return', [DemoAccountController::class, 'return'])->name('demo-accounts.return');

    Route::middleware('can:manage-users')->group(function () {
        Route::get('{role}', [UserController::class, 'index'])->whereIn('role', ['teachers', 'students', 'organizations'])->name('users.index');
        Route::post('{role}', [UserController::class, 'store'])->whereIn('role', ['teachers', 'students', 'organizations'])->name('users.store');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    });
    Route::get('feed', [FeedController::class, 'index'])->name('feed.index');
    Route::get('events', [EventController::class, 'index'])->name('events.index');
    Route::get('voting', [VotingController::class, 'index'])->name('voting.index');
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
