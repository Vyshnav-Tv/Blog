<?php

namespace App\Services;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class PostService
{
    public function publicPosts(array $filters): LengthAwarePaginator
    {
        $query = Post::with('user')->where('status', 'enabled');

        if (! empty($filters['search'])) {
            $query->where('title', 'like', '%'.$filters['search'].'%');
        }

        return $query->latest()->paginate(9)->withQueryString();
    }

    public function publicPost(string $slug): Post
    {
        return Post::with('user')
            ->where('slug', $slug)
            ->where('status', 'enabled')
            ->firstOrFail();
    }

    public function userPost(Post $post): Post
    {
        return $post->load('user');
    }

    public function myPosts(User $user, array $filters): LengthAwarePaginator
    {
        $query = $user->posts();

        if (! empty($filters['search'])) {
            $query->where('title', 'like', '%'.$filters['search'].'%');
        }

        return $query->latest()->paginate(10)->withQueryString();
    }

    public function create(User $user, StorePostRequest $request): Post
    {
        $data = $request->validated();
        $featuredImage = null;
        if ($request->hasFile('featured_image')) {
            $featuredImage = $request->file('featured_image')->store('posts');

            if (! $featuredImage) {
                throw new RuntimeException('Unable to store the featured image.');
            }
        }

        return $user->posts()->create([
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['title']),
            'content' => $data['content'],
            'featured_image' => $featuredImage,
            'status' => 'enabled',
        ]);
    }

    public function update(Post $post, UpdatePostRequest $request): Post
    {
        $data = $request->validated();

        if (isset($data['title']) && $data['title'] !== $post->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], $post->id);
        }

        $oldImage = $post->featured_image;

        if ($request->hasFile('featured_image')) {
            $newImage = $request->file('featured_image')->store('posts');

            if (! $newImage) {
                throw new RuntimeException('Unable to store the featured image.');
            }

            $data['featured_image'] = $newImage;
        }

        $post->update($data);

        if ($oldImage && $oldImage !== $post->featured_image) {
            Storage::delete($oldImage);
        }

        return $post->fresh('user');
    }

    public function delete(Post $post): void
    {
        if ($post->featured_image) {
            Storage::delete($post->featured_image);
        }

        $post->delete();
    }

    private function uniqueSlug(string $title, ?int $exceptId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $number = 2;

        while (true) {
            $query = Post::where('slug', $slug);
            if ($exceptId !== null) {
                $query->where('id', '!=', $exceptId);
            }

            if (! $query->exists()) {
                break;
            }

            $slug = $base.'-'.$number++;
        }

        return $slug;
    }
}
