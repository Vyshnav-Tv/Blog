<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
        $this->actingAs($writer, 'sanctum');

        $this->postJson('/api/posts', [
            'title' => 'A Simple Story',
            'content' => 'The story content.',
        ])->assertCreated()
            ->assertJsonPath('data.slug', 'a-simple-story');

        $this->getJson('/api/public/posts/a-simple-story')
            ->assertOk()
            ->assertJsonPath('data.title', 'A Simple Story')
            ->assertJsonMissingPath('data.author.email');
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
