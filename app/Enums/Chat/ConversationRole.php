<?php

namespace App\Enums\Chat;

enum ConversationRole: string
{
    case OWNER = 'owner';
    case ADMIN = 'admin';
    case MEMBER = 'member';
}