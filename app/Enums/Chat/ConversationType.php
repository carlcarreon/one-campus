<?php

namespace App\Enums\Chat;

enum ConversationType: string
{
    case DIRECT = 'direct';
    case GROUP = 'group';
}