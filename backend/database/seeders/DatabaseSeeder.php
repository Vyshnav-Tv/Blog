<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@journal.test'],
            [
                'name' => 'Journal Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'description' => 'Administrator account.',
            ],
        );

        $author = User::updateOrCreate(
            ['email' => 'writer@journal.test'],
            [
                'name' => 'Maya Chen',
                'password' => Hash::make('password'),
                'role' => 'user',
                'description' => 'Writer and independent editor.',
            ],
        );

        Post::updateOrCreate(
            ['slug' => 'the-art-of-working-slowly'],
            [
                'user_id' => $author->id,
                'title' => 'The Art of Working Slowly',
                'content' => "Good work rarely begins with urgency. It begins with attention, patience, and the willingness to remove what is unnecessary.\n\nWorking slowly does not mean working less. It means giving an idea enough room to become clear.",
                'status' => 'enabled',
            ],
        );
    }
}
