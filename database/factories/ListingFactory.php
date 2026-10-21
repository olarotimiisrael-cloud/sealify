<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ListingFactory extends Factory
{
    public function definition(): array
    {
        $category = Category::whereNotNull('parent_id')->inRandomOrder()->first()
            ?? Category::inRandomOrder()->first();

        return [
            'category_id' => $category?->id ?? 1,
            'title' => $this->faker->sentence(4),
            'slug' => null,  // auto-generated in the model
            'description' => $this->faker->paragraph(3),
            'price' => $this->faker->numberBetween(5000, 500000),
            'price_negotiable' => $this->faker->boolean(30),
            'condition' => $this->faker->randomElement(['new', 'like_new', 'good', 'fair', 'needs_repair']),
            'location' => $this->faker->randomElement([
                'Ogbomoso', 'Ibadan', 'Oyo', 'Lagos', 'Abuja', 'Osogbo',
            ]),
            'status' => 'active',
        ];
    }
}
