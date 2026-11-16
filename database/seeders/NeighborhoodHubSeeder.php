<?php

namespace Database\Seeders;

use App\Models\NeighborhoodHub;
use Illuminate\Database\Seeder;

class NeighborhoodHubSeeder extends Seeder
{
    public function run(): void
    {
        $hubs = [
            ['key' => 'all', 'label' => 'All Ogbomoso', 'icon' => 'grid', 'query' => null, 'sort_order' => 0],
            ['key' => 'under-g', 'label' => 'Under G', 'icon' => 'home', 'query' => 'Under G', 'sort_order' => 1],
            ['key' => 'lautech-gate', 'label' => 'LAUTECH Gate', 'icon' => 'academic', 'query' => 'LAUTECH', 'sort_order' => 2],
            ['key' => 'takie-square', 'label' => 'Takie Square', 'icon' => 'building', 'query' => 'Takie', 'sort_order' => 3],
            ['key' => 'sabo-market', 'label' => 'Sabo Market', 'icon' => 'store', 'query' => 'Sabo', 'sort_order' => 4],
            ['key' => 'adenike-area', 'label' => 'Adenike Area', 'icon' => 'building', 'query' => 'Adenike', 'sort_order' => 5],
            ['key' => 'aroje-akala', 'label' => 'Aroje & Akala Way', 'icon' => 'map', 'query' => 'Aroje', 'sort_order' => 6],
        ];

        foreach ($hubs as $hub) {
            NeighborhoodHub::updateOrCreate(['key' => $hub['key']], $hub);
        }
    }
}