<?php

namespace Database\Factories;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'commentable_type' => Listing::class,
            'commentable_id' => Listing::factory(),
            'parent_id' => null,
            'content' => $this->faker->sentence(),
        ];
    }
}
