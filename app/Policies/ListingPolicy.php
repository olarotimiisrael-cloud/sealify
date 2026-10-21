<?php

namespace App\Policies;

use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Listing $listing): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isActive();
    }

    public function update(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }

    public function delete(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }

    public function restore(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }

    public function forceDelete(User $user, Listing $listing): bool
    {
        return false;
    }
}
