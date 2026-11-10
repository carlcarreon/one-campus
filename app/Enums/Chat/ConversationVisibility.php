<?php

namespace App\Enums\Chat;

enum ConversationVisibility: string
{
    case PUBLIC = 'public';
    case PRIVATE = 'private';
}