<?php

namespace Database\Factories;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Reaction>
 */
class ReactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'reactionable_type' => Listing::class,
            'reactionable_id' => Listing::factory(),
            'reaction_type' => $this->faker->randomElement(['like', 'love', 'haha', 'wow', 'sad', 'angry']),
        ];
    }
}
