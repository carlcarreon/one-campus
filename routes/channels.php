<?php
use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, string $id) {
    return (string) $user->id === $id;
});

Broadcast::channel('conversation.{conversationId}', function ($user, string $conversationId) {
    return Conversation::query()
        ->whereKey($conversationId)
        ->whereHas('participants', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })
        ->exists();
});
