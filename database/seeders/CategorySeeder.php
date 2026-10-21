<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $tree = [
            ['name' => 'Phones & Tablets', 'slug' => 'phones-tablets', 'icon' => 'smartphone', 'children' => [
                ['name' => 'Smartphones',         'slug' => 'smartphones'],
                ['name' => 'Tablets',             'slug' => 'tablets'],
                ['name' => 'Phone Accessories',   'slug' => 'phone-accessories'],
                ['name' => 'Phone Repairs',       'slug' => 'phone-repairs'],
            ]],
            ['name' => 'Vehicles', 'slug' => 'vehicles', 'icon' => 'car', 'children' => [
                ['name' => 'Cars',                'slug' => 'cars'],
                ['name' => 'Motorcycles',         'slug' => 'motorcycles'],
                ['name' => 'Buses & Trucks',      'slug' => 'buses-trucks'],
                ['name' => 'Vehicle Parts',       'slug' => 'vehicle-parts'],
            ]],
            ['name' => 'Property', 'slug' => 'property', 'icon' => 'home', 'children' => [
                ['name' => 'Houses for Sale',     'slug' => 'houses-for-sale'],
                ['name' => 'Houses for Rent',     'slug' => 'houses-for-rent'],
                ['name' => 'Land',                'slug' => 'land'],
                ['name' => 'Short Let',           'slug' => 'short-let'],
            ]],
            ['name' => 'Fashion', 'slug' => 'fashion', 'icon' => 'shirt', 'children' => [
                ['name' => "Men's Fashion",       'slug' => 'mens-fashion'],
                ['name' => "Women's Fashion",     'slug' => 'womens-fashion'],
                ['name' => 'Shoes',               'slug' => 'shoes'],
                ['name' => 'Bags',                'slug' => 'bags'],
            ]],
            ['name' => 'Home & Garden', 'slug' => 'home-garden', 'icon' => 'sofa', 'children' => [
                ['name' => 'Furniture',           'slug' => 'furniture'],
                ['name' => 'Appliances',          'slug' => 'appliances'],
                ['name' => 'Kitchen',             'slug' => 'kitchen'],
                ['name' => 'Decor',               'slug' => 'decor'],
            ]],
            ['name' => 'Services', 'slug' => 'services', 'icon' => 'wrench', 'children' => [
                ['name' => 'Repairs',             'slug' => 'repairs'],
                ['name' => 'Tutoring',            'slug' => 'tutoring'],
                ['name' => 'Beauty & Spa',        'slug' => 'beauty-spa'],
                ['name' => 'Events',              'slug' => 'events'],
            ]],
            ['name' => 'Jobs', 'slug' => 'jobs', 'icon' => 'briefcase', 'children' => [
                ['name' => 'Full-time',           'slug' => 'full-time'],
                ['name' => 'Part-time',           'slug' => 'part-time'],
                ['name' => 'Gig',                 'slug' => 'gig'],
                ['name' => 'Freelance',           'slug' => 'freelance'],
            ]],
            ['name' => 'Electronics', 'slug' => 'electronics', 'icon' => 'laptop', 'children' => [
                ['name' => 'Laptops',             'slug' => 'laptops'],
                ['name' => 'TVs & Audio',         'slug' => 'tvs-audio'],
                ['name' => 'Cameras',             'slug' => 'cameras'],
                ['name' => 'Gaming',              'slug' => 'gaming'],
            ]],
            ['name' => 'Babies & Kids', 'slug' => 'babies-kids', 'icon' => 'baby', 'children' => [
                ['name' => 'Clothing',            'slug' => 'baby-clothing'],
                ['name' => 'Toys',                'slug' => 'toys'],
                ['name' => 'Furniture',           'slug' => 'baby-furniture'],
                ['name' => 'Gear',                'slug' => 'baby-gear'],
            ]],
            ['name' => 'Pets', 'slug' => 'pets', 'icon' => 'paw', 'children' => [
                ['name' => 'Dogs',                'slug' => 'dogs'],
                ['name' => 'Cats',                'slug' => 'cats'],
                ['name' => 'Birds',               'slug' => 'birds'],
                ['name' => 'Pet Supplies',        'slug' => 'pet-supplies'],
            ]],
            ['name' => 'Agriculture', 'slug' => 'agriculture', 'icon' => 'leaf', 'children' => [
                ['name' => 'Livestock',           'slug' => 'livestock'],
                ['name' => 'Farm Produce',        'slug' => 'farm-produce'],
                ['name' => 'Equipment',           'slug' => 'agriculture-equipment'],
                ['name' => 'Seeds',               'slug' => 'seeds'],
            ]],
            ['name' => 'Business & Industry', 'slug' => 'business-industry', 'icon' => 'factory', 'children' => [
                ['name' => 'Machinery',           'slug' => 'machinery'],
                ['name' => 'Office Equipment',    'slug' => 'office-equipment'],
                ['name' => 'Wholesale',           'slug' => 'wholesale'],
                ['name' => 'Business Services',   'slug' => 'business-services'],
            ]],
        ];

        $sort = 1;

        foreach ($tree as $parentDef) {
            $parent = Category::updateOrCreate(
                ['slug' => $parentDef['slug']],
                [
                    'parent_id' => null,
                    'name' => $parentDef['name'],
                    'icon' => $parentDef['icon'] ?? null,
                    'sort_order' => $sort++,
                    'is_active' => true,
                ]
            );

            $childSort = 1;

            foreach ($parentDef['children'] as $childDef) {
                Category::updateOrCreate(
                    ['slug' => $childDef['slug']],
                    [
                        'parent_id' => $parent->id,
                        'name' => $childDef['name'],
                        'icon' => null,
                        'sort_order' => $childSort++,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
