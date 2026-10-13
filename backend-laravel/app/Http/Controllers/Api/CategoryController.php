<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return response()->json(['categories' => $categories]);
    }

    public function show(string $id)
    {
        $category = Category::findOrFail($id);

        return response()->json($category);
    }
}
