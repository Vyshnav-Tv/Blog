<?php

namespace App\Services;

use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    public function update(User $user, UpdateProfileRequest $request): User
    {
        $data = $request->validated();

        if (isset($data['profile_image']) && $data['profile_image'] instanceof UploadedFile) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }
            $data['profile_image'] = $data['profile_image']->store('profiles', 'public');
        }

        $user->update($data);

        return $user->fresh();
    }
}
