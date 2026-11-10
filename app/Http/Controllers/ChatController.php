<?php

namespace App\Http\Controllers;

use App\Enums\Chat\ConversationVisibility;
use App\Http\Requests\Chat\CreateGroupRequest;
use App\Http\Requests\Chat\SendMessageRequest;
use App\Http\Resources\Chat\ConversationResource;
use App\Http\Resources\Chat\MessageResource;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function __construct(
        private readonly ChatService $chatService
    ) {}

    public function index(Request $request): Response
    {
        $conversations = $this->chatService->getConversations(
            $request->user()
        );

        return Inertia::render('chat/index', [
            'conversations' => ConversationResource::collection(
                $conversations
            )->resolve($request),

            'currentUserId' => $request->user()->id,
        ]);
    }

    public function searchMembers(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => [
                'nullable',
                'string',
                'max:100',
            ],
        ]);

        $members = $this->chatService->searchMembers(
            $request->user(),
            $validated['search'] ?? ''
        );

        return response()->json([
            'data' => $members->map(fn ($member) => [
                'id' => $member->id,
                'name' => $member->name,
            ]),
        ]);
    }

    public function storeGroup(
        CreateGroupRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        $conversation = $this->chatService->createGroup(
            $request->user(),
            $validated['name'],
            ConversationVisibility::from($validated['visibility']),
            $validated['member_ids'] ?? []
        );

        return (new ConversationResource($conversation))
            ->response()
            ->setStatusCode(201);
    }

    public function show(
        Request $request,
        string $conversation
    ): JsonResponse {
        $messages = $this->chatService->getMessages(
            $request->user(),
            $conversation
        );

        return MessageResource::collection($messages)->response();
    }

    public function store(
        SendMessageRequest $request,
        string $conversation
    ): JsonResponse {
        $message = $this->chatService->sendMessage(
            $request->user(),
            $conversation,
            $request->validated('body')
        );

        return (new MessageResource($message))
            ->response()
            ->setStatusCode(201);
    }

    public function markAsRead(
        Request $request,
        string $conversation
    ): JsonResponse {
        $this->chatService->markAsRead(
            $request->user(),
            $conversation
        );

        return response()->json([
            'message' => 'Conversation marked as read.',
        ]);
    }
}
