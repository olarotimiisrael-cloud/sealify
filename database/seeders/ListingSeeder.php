<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Seeder;

class ListingSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'yahayaibraheem808@gmail.com')->first()
            ?? User::first();

        if (! $user) {
            $this->command->error('No user in the database. Register via the API first.');

            return;
        }

        $samples = [
            [
                'category_slug' => 'smartphones',
                'title' => 'iPhone 13 Pro 256GB',
                'price' => 620000,
                'condition' => 'like_new',
                'location' => 'Ogbomoso',
                'description' => 'Clean iPhone 13 Pro, 256GB, no scratches, original box and charger included. Battery health 92%.',
                'price_negotiable' => true,
            ],
            [
                'category_slug' => 'cars',
                'title' => 'Toyota Corolla 2015',
                'price' => 8500000,
                'condition' => 'good',
                'location' => 'Ibadan',
                'description' => 'Well maintained Toyota Corolla 2015, first body, AC working, papers complete. Serious buyers only.',
                'price_negotiable' => true,
            ],
            [
                'category_slug' => 'laptops',
                'title' => 'MacBook Air M1 8GB/256GB',
                'price' => 550000,
                'condition' => 'like_new',
                'location' => 'Lagos',
                'description' => 'MacBook Air M1 in excellent condition, battery cycle 89, with charger and sleeve. No dents.',
                'price_negotiable' => false,
            ],
            [
                'category_slug' => 'furniture',
                'title' => '6-Seater Dining Table Set',
                'price' => 85000,
                'condition' => 'new',
                'location' => 'Oyo',
                'description' => 'Brand new 6-seater dining table with glass top and padded chairs, local hardwood.',
                'price_negotiable' => true,
            ],
            [
                'category_slug' => 'mens-fashion',
                'title' => 'Ankara Native Senator Wear',
                'price' => 25000,
                'condition' => 'new',
                'location' => 'Osogbo',
                'description' => 'Custom-made Ankara senator outfit, size 42, perfect for weddings and events.',
                'price_negotiable' => false,
            ],
            [
                'category_slug' => 'smartphones',
                'title' => 'Samsung Galaxy S21 Ultra',
                'price' => 380000,
                'condition' => 'good',
                'location' => 'Ogbomoso',
                'description' => 'Samsung Galaxy S21 Ultra, 12GB/256GB, screen protector on since day one, no cracks.',
                'price_negotiable' => true,
            ],
            [
                'category_slug' => 'motorcycles',
                'title' => 'Bajaj Boxer 150cc',
                'price' => 320000,
                'condition' => 'good',
                'location' => 'Oyo',
                'description' => 'Bajaj Boxer 150cc, well-serviced, engine sound clean, papers intact.',
                'price_negotiable' => true,
            ],
            [
                'category_slug' => 'appliances',
                'title' => 'LG 1.5HP Split AC',
                'price' => 185000,
                'condition' => 'like_new',
                'location' => 'Ibadan',
                'description' => 'LG 1.5HP split AC, barely used, comes with full installation kit.',
                'price_negotiable' => false,
            ],
        ];

        foreach ($samples as $sample) {
            $category = Category::where('slug', $sample['category_slug'])->first();

            if (! $category) {
                $this->command->warn("Category not found: {$sample['category_slug']} — skipping.");

                continue;
            }

            $listing = Listing::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'title' => $sample['title'],
                'description' => $sample['description'],
                'price' => $sample['price'],
                'price_negotiable' => $sample['price_negotiable'],
                'condition' => $sample['condition'],
                'location' => $sample['location'],
                'status' => 'active',
            ]);

            $this->command->info("Created listing: {$listing->title} ({$listing->slug})");
        }
    }
}
