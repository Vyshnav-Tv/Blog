<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BlogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_visitor_can_register_and_receive_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New Writer',
            'email' => 'writer@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.name', 'New Writer')
            ->assertJsonPath('user.role', 'user')
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'writer@example.test']);
    }

    public function test_a_user_can_log_in_and_log_out(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.test',
            'password' => 'password123',
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'login@example.test',
            'password' => 'password123',
        ]);

        $loginResponse->assertOk()->assertJsonStructure(['user', 'token']);
        $token = $loginResponse->json('token');

        $this->withToken($token)->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_a_user_can_create_a_post_and_the_public_can_read_it(): void
    {
        $writer = User::factory()->create();
        $fullArticle = trim(str_repeat('Full article paragraph. ', 40));
        $this->actingAs($writer, 'sanctum');

        $this->postJson('/api/posts', [
            'title' => 'A Simple Story',
            'content' => $fullArticle,
        ])->assertCreated()
            ->assertJsonPath('data.slug', 'a-simple-story');

        $this->getJson('/api/public/posts/a-simple-story')
            ->assertOk()
            ->assertJsonPath('data.title', 'A Simple Story')
            ->assertJsonPath('data.content', $fullArticle)
            ->assertJsonMissingPath('data.author.email');
    }

    public function test_a_post_image_is_saved_and_returned_as_a_public_url(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);
        $writer = User::factory()->create();

        $response = $this->actingAs($writer, 'sanctum')->post('/api/posts', [
            'title' => 'Image Story',
            'content' => 'The story has a featured image.',
            'featured_image' => UploadedFile::fake()->image('featured.png', 20, 20),
        ], ['Accept' => 'application/json']);

        $response->assertCreated();
        $imagePath = $response->json('data.featured_image');
        $databasePath = Post::where('title', 'Image Story')->value('featured_image');

        $this->assertNotEmpty($databasePath);
        Storage::disk('public')->assertExists($databasePath);
        $this->assertSame(Storage::disk('public')->url($databasePath), $imagePath);
    }

    public function test_replacing_a_post_image_removes_the_old_file(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);
        $writer = User::factory()->create();
        $oldImagePath = 'posts/old-image.png';
        Storage::disk('public')->put($oldImagePath, 'old image');
        $post = Post::create([
            'user_id' => $writer->id,
            'title' => 'Replace Image',
            'slug' => 'replace-image',
            'content' => 'Post content',
            'featured_image' => $oldImagePath,
        ]);

        $response = $this->actingAs($writer, 'sanctum')->post('/api/posts/'.$post->id, [
            '_method' => 'PUT',
            'title' => 'Replace Image',
            'content' => 'Updated post content',
            'featured_image' => UploadedFile::fake()->image('new-image.png', 20, 20),
        ], ['Accept' => 'application/json']);

        $response->assertOk();
        $newImagePath = Post::findOrFail($post->id)->featured_image;

        Storage::disk('public')->assertMissing($oldImagePath);
        Storage::disk('public')->assertExists($newImagePath);
        $this->assertSame(
            Storage::disk('public')->url($newImagePath),
            $response->json('data.featured_image'),
        );
    }

    public function test_invalid_and_oversized_post_images_are_rejected(): void
    {
        $writer = User::factory()->create();
        $this->actingAs($writer, 'sanctum');

        $this->post('/api/posts', [
            'title' => 'Invalid Image',
            'content' => 'Post content',
            'featured_image' => UploadedFile::fake()->create('not-an-image.txt', 10, 'text/plain'),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.featured_image.0', 'Choose a valid image file.');

        $this->post('/api/posts', [
            'title' => 'Oversized Image',
            'content' => 'Post content',
            'featured_image' => UploadedFile::fake()->image('oversized.png', 20, 20)->size(2049),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.featured_image.0', 'The featured image must be 2 MB or smaller.');
    }

    public function test_a_user_cannot_edit_another_users_post(): void
    {
        $owner = User::factory()->create();
        $anotherUser = User::factory()->create();
        $post = Post::create([
            'user_id' => $owner->id,
            'title' => 'Owner post',
            'slug' => 'owner-post',
            'content' => 'Original content',
            'status' => 'enabled',
        ]);

        $this->actingAs($anotherUser, 'sanctum')
            ->putJson('/api/posts/'.$post->id, ['title' => 'Changed title'])
            ->assertForbidden();

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'Owner post',
        ]);
    }

    public function test_a_user_can_update_their_profile_description(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile', [
                'name' => 'Updated Name',
                'description' => 'A short biography.',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.description', 'A short biography.');
    }

    public function test_a_user_can_upload_and_replace_their_profile_picture(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);
        $user = User::factory()->create();

        $firstResponse = $this->actingAs($user, 'sanctum')->post('/api/profile', [
            '_method' => 'PUT',
            'name' => $user->name,
            'profile_image' => UploadedFile::fake()->image('profile.png', 20, 20),
        ], ['Accept' => 'application/json']);

        $firstResponse->assertOk();
        $oldImagePath = $user->fresh()->profile_image;
        Storage::disk('public')->assertExists($oldImagePath);
        $this->assertSame(
            Storage::disk('public')->url($oldImagePath),
            $firstResponse->json('data.profile_image'),
        );

        $secondResponse = $this->post('/api/profile', [
            '_method' => 'PUT',
            'name' => $user->name,
            'profile_image' => UploadedFile::fake()->image('new-profile.png', 20, 20),
        ], ['Accept' => 'application/json']);

        $secondResponse->assertOk();
        $newImagePath = $user->fresh()->profile_image;
        Storage::disk('public')->assertMissing($oldImagePath);
        Storage::disk('public')->assertExists($newImagePath);
        $this->assertSame(
            Storage::disk('public')->url($newImagePath),
            $secondResponse->json('data.profile_image'),
        );
    }

    public function test_invalid_and_oversized_profile_pictures_are_rejected(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $this->post('/api/profile', [
            '_method' => 'PUT',
            'name' => $user->name,
            'profile_image' => UploadedFile::fake()->create('not-an-image.txt', 10, 'text/plain'),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.profile_image.0', 'Choose a valid profile image.');

        $this->post('/api/profile', [
            '_method' => 'PUT',
            'name' => $user->name,
            'profile_image' => UploadedFile::fake()->image('oversized.png', 20, 20)->size(2049),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.profile_image.0', 'The profile image must be 2 MB or smaller.');
    }

    public function test_an_admin_can_disable_a_post_and_remove_it_from_public_results(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $writer = User::factory()->create();
        $post = Post::create([
            'user_id' => $writer->id,
            'title' => 'Moderated post',
            'slug' => 'moderated-post',
            'content' => 'Post content',
            'status' => 'enabled',
        ]);

        $this->actingAs($writer, 'sanctum')
            ->getJson('/api/admin/dashboard')
            ->assertForbidden();

        $this->actingAs($admin, 'sanctum')
            ->patchJson('/api/admin/posts/'.$post->id.'/disable')
            ->assertOk()
            ->assertJsonPath('data.status', 'disabled');

        $this->getJson('/api/public/posts')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->getJson('/api/public/posts/moderated-post')->assertNotFound();

        $this->patchJson('/api/admin/posts/'.$post->id.'/enable')
            ->assertOk()
            ->assertJsonPath('data.status', 'enabled');

        $this->getJson('/api/public/posts/moderated-post')->assertOk();
    }
}
