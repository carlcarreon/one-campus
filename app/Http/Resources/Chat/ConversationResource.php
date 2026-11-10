<?php

namespace App\Http\Resources\Chat;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'name' => $this->name,
            'visibility' => $this->visibility?->value,

            'creator' => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ],

            'participants' => $this->participants->map(
                fn ($participant) => [
                    'id' => $participant->id,
                    'name' => $participant->name,
                    'role' => $participant->pivot->role,
                ]
            ),

            'latest_message' => $this->latestMessage
                ? new MessageResource($this->latestMessage)
                : null,

            'unread_count' => $this->unread_count,

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
