<?php

namespace App\Services;

use App\Enums\Chat\ConversationVisibility;
use App\Events\Chat\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Repositories\Contracts\ConversationRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ChatService
{
    public function __construct(
        private readonly ConversationRepositoryInterface $conversations,
    ) {}

    public function getConversations(User $user): Collection
    {
        return $this->conversations->getForUser($user);
    }

    public function searchMembers(
        User $user,
        string $search
    ): Collection {
        return $this->conversations->searchMembers($user, $search);
    }

    public function createGroup(
        User $creator,
        string $name,
        ConversationVisibility $visibility,
        array $memberIds
    ): Conversation {
        return DB::transaction(function () use (
            $creator,
            $name,
            $visibility,
            $memberIds
        ) {
            $memberIds = array_values(array_unique($memberIds));

            return $this->conversations->createGroup(
                $creator,
                $name,
                $visibility,
                $memberIds
            );
        });
    }

    public function getMessages(
        User $user,
        string $conversationId
    ): LengthAwarePaginator {
        $conversation = $this->getAccessibleConversation(
            $user,
            $conversationId
        );

        return $this->conversations->getMessages($conversation);
    }

    public function sendMessage(
        User $user,
        string $conversationId,
        string $body
    ): Message {
        $conversation = $this->getAccessibleConversation(
            $user,
            $conversationId
        );

        Gate::forUser($user)->authorize('sendMessage', $conversation);

        $message = DB::transaction(function () use (
            $conversation,
            $user,
            $body
        ) {
            return $this->conversations->createMessage(
                $conversation,
                $user,
                $body
            );
        });

        DB::afterCommit(function () use ($message) {
            broadcast(new MessageSent($message))->toOthers();
        });

        return $message;
    }

    public function markAsRead(
        User $user,
        string $conversationId
    ): void {
        $conversation = $this->getAccessibleConversation(
            $user,
            $conversationId
        );

        $this->conversations->markAsRead($conversation, $user);
    }

    private function getAccessibleConversation(
        User $user,
        string $conversationId
    ): Conversation {
        $conversation = $this->conversations->findForUser(
            $user,
            $conversationId
        );

        if (! $conversation) {
            throw new AuthorizationException(
                'You are not allowed to access this conversation.'
            );
        }

        Gate::forUser($user)->authorize('view', $conversation);

        return $conversation;
    }
}
