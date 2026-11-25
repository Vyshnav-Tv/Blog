<?php

namespace App\Services;

use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ProfileService
{
    public function update(User $user, UpdateProfileRequest $request): User
    {
        $data = $request->validated();
        $oldImage = $user->profile_image;

        if ($request->hasFile('profile_image')) {
            $newImage = $request->file('profile_image')->store('profiles');

            if (! $newImage) {
                throw new RuntimeException('Unable to store the profile image.');
            }

            $data['profile_image'] = $newImage;
        }

        $user->update($data);

        if ($oldImage && $oldImage !== $user->profile_image) {
            Storage::delete($oldImage);
        }

        return $user->fresh();
    }
}
