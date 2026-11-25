<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    public function __construct(private readonly PostService $postService) {}

    public function publicIndex(Request $request)
    {
        $posts = $this->postService->publicPosts($request->only('search'));

        return PostResource::collection($posts);
    }

    public function publicShow(string $slug): JsonResponse
    {
        $post = $this->postService->publicPost($slug);

        return response()->json(['data' => new PostResource($post)]);
    }

    public function mine(Request $request)
    {
        $posts = $this->postService->myPosts($request->user(), $request->only('search'));

        return PostResource::collection($posts);
    }

    public function show(Post $post): JsonResponse
    {
        Gate::authorize('update', $post);

        return response()->json([
            'data' => new PostResource($this->postService->userPost($post)),
        ]);
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $post = $this->postService->create($request->user(), $request);

        return response()->json(['data' => new PostResource($post->load('user'))], 201);
    }

    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        Gate::authorize('update', $post);
        $post = $this->postService->update($post, $request);

        return response()->json(['data' => new PostResource($post)]);
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        Gate::authorize('delete', $post);
        $this->postService->delete($post);

        return response()->json(['message' => 'Post deleted successfully.']);
    }
}
