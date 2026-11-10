<?php

namespace App\Repositories\Eloquent;

use App\Enums\Chat\ConversationRole;
use App\Enums\Chat\ConversationType;
use App\Enums\Chat\ConversationVisibility;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Repositories\Contracts\ConversationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\Builder as QueryBuilder;

class ConversationRepository implements ConversationRepositoryInterface
{
    public function getForUser(User $user): Collection
    {
        return Conversation::query()
            ->whereHas('participants', function (Builder $query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->with([
                'creator',
                'participants',
                'latestMessage.sender',
            ])
            ->withCount([
                'messages as unread_count' => function (Builder $query) use ($user) {
                    $query
                        ->where('sender_id', '!=', $user->id)
                        ->where(function (Builder $query) use ($user) {
                            $query->whereNotExists(
                                function (QueryBuilder $subquery) use ($user) {
                                    $subquery
                                        ->selectRaw('1')
                                        ->from('conversation_user as cu')
                                        ->whereColumn(
                                            'cu.conversation_id',
                                            'messages.conversation_id'
                                        )
                                        ->where('cu.user_id', $user->id)
                                        ->whereNotNull('cu.last_read_at');
                                }
                            )->orWhereRaw(
                                'messages.created_at > (
                                    SELECT cu.last_read_at
                                    FROM conversation_user as cu
                                    WHERE cu.conversation_id = messages.conversation_id
                                    AND cu.user_id = ?
                                )',
                                [$user->id]
                            );
                        });
                },
            ])
            ->latest('updated_at')
            ->get();
    }

    public function findForUser(
        User $user,
        string $conversationId
    ): ?Conversation {
        return Conversation::query()
            ->whereKey($conversationId)
            ->whereHas('participants', function (Builder $query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->with(['participants'])
            ->first();
    }

    public function getMessages(
        Conversation $conversation,
        int $perPage = 30
    ): LengthAwarePaginator {
        return $conversation->messages()
            ->with('sender')
            ->latest('created_at')
            ->paginate($perPage);
    }

    public function createMessage(
        Conversation $conversation,
        User $sender,
        string $body
    ): Message {
        $message = $conversation->messages()->create([
            'sender_id' => $sender->id,
            'body' => $body,
        ]);

        $conversation->touch();

        return $message->load('sender');
    }

    public function markAsRead(
        Conversation $conversation,
        User $user
    ): void {
        $conversation->participants()->updateExistingPivot(
            $user->id,
            ['last_read_at' => now()]
        );
    }

    public function searchMembers(
        User $user,
        string $search
    ): Collection {
        $search = trim($search);

        return User::query()
            ->whereKeyNot($user->id)
            ->when(
                $search !== '',
                fn (Builder $query) => $query->where(
                    'name',
                    'ilike',
                    "%{$search}%"
                )
            )
            ->select([
                'id',
                'name',
            ])
            ->orderBy('name')
            ->limit(20)
            ->get();
    }

    public function createGroup(
        User $creator,
        string $name,
        ConversationVisibility $visibility,
        array $memberIds
    ): Conversation {
        $conversation = Conversation::query()->create([
            'type' => ConversationType::GROUP,
            'name' => $name,
            'visibility' => $visibility,
            'created_by' => $creator->id,
        ]);

        $participants = [
            $creator->id => [
                'role' => ConversationRole::OWNER->value,
                'joined_at' => now(),
            ],
        ];

        foreach ($memberIds as $memberId) {
            if ($memberId === $creator->id) {
                continue;
            }

            $participants[$memberId] = [
                'role' => ConversationRole::MEMBER->value,
                'joined_at' => now(),
            ];
        }

        $conversation->participants()->attach($participants);

        return $conversation->load([
            'creator',
            'participants',
        ]);
    }
}
