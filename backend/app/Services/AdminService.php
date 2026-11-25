<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminService
{
    public function dashboard(): array
    {
        return [
            'users' => User::count(),
            'posts' => Post::count(),
            'enabled' => Post::where('status', 'enabled')->count(),
            'disabled' => Post::where('status', 'disabled')->count(),
        ];
    }

    public function posts(array $filters): LengthAwarePaginator
    {
        $query = Post::with('user');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($postQuery) use ($search) {
                $postQuery->where('title', 'like', '%'.$search.'%')
                    ->orWhereHas('user', function ($authorQuery) use ($search) {
                        $authorQuery->where('name', 'like', '%'.$search.'%');
                    });
            });
        }

        return $query->latest()->paginate(10)->withQueryString();
    }

    public function setStatus(Post $post, string $status): Post
    {
        $post->update(['status' => $status]);

        return $post->fresh('user');
    }
}
