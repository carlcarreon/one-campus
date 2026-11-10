<?php

namespace App\Http\Requests\Chat;

use App\Enums\Chat\ConversationVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:100',
            ],

            'visibility' => [
                'required',
                Rule::enum(ConversationVisibility::class),
            ],

            'member_ids' => [
                'sometimes',
                'array',
            ],

            'member_ids.*' => [
                'required',
                'uuid',
                'distinct',
                'exists:users,id',
            ],
        ];
    }
}
