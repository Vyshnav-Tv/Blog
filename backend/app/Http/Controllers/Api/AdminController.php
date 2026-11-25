<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(private readonly AdminService $adminService) {}

    public function dashboard(): JsonResponse
    {
        return response()->json(['stats' => $this->adminService->dashboard()]);
    }

    public function posts(Request $request)
    {
        $posts = $this->adminService->posts($request->only(['search', 'status']));

        return PostResource::collection($posts);
    }

    public function enable(Post $post): JsonResponse
    {
        $post = $this->adminService->setStatus($post, 'enabled');

        return response()->json(['data' => new PostResource($post)]);
    }

    public function disable(Post $post): JsonResponse
    {
        $post = $this->adminService->setStatus($post, 'disabled');

        return response()->json(['data' => new PostResource($post)]);
    }
}
