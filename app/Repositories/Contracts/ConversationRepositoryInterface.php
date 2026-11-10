<?php

namespace App\Repositories\Contracts;

use App\Enums\Chat\ConversationVisibility;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ConversationRepositoryInterface
{
    public function getForUser(User $user): Collection;

    public function findForUser(
        User $user,
        string $conversationId
    ): ?Conversation;

    public function getMessages(
        Conversation $conversation,
        int $perPage = 30
    ): LengthAwarePaginator;

    public function createMessage(
        Conversation $conversation,
        User $sender,
        string $body
    ): Message;

    public function markAsRead(
        Conversation $conversation,
        User $user
    ): void;

    public function searchMembers(
        User $user,
        string $search
    ): Collection;

    public function createGroup(
        User $creator,
        string $name,
        ConversationVisibility $visibility,
        array $memberIds
    ): Conversation;
}
