<?php

namespace App\Models;

use App\Enums\Chat\ConversationType;
use App\Enums\Chat\ConversationVisibility;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'type',
    'name',
    'visibility',
    'created_by',
])]
class Conversation extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'type' => ConversationType::class,
            'visibility' => ConversationVisibility::class,
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_user')
            ->withPivot([
                'role',
                'joined_at',
                'last_read_at',
            ])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)
            ->orderByDesc('created_at');
    }
}