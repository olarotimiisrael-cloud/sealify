<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->active()
            ->topLevel()
            ->with(['children' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::query()
            ->active()
            ->where('slug', $slug)
            ->with([
                'parent',
                'children' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'),
            ])
            ->firstOrFail();

        return response()->json([
            'data' => new CategoryResource($category),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'icon' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'parent_id' => ['nullable', 'uuid', 'exists:categories,id'],
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $validated['icon'] = $validated['icon'] ?? 'Package';
        $validated['color'] = $validated['color'] ?? '#16a34a';
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        DB::transaction(function () use ($validated): void {
            Category::create($validated);
        });

        return response()->json([
            'message' => 'Category created successfully',
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', 'unique:categories,name,'.$category->id],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug,'.$category->id],
            'icon' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'parent_id' => ['nullable', 'uuid', 'exists:categories,id'],
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        }

        $category->update(array_filter($validated, fn ($v) => $v !== null));

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => new CategoryResource($category->fresh()),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        // Prevent deleting categories that have listings
        $listingCount = $category->listings()->count();
        if ($listingCount > 0) {
            return response()->json([
                'message' => 'Cannot delete category with active listings. Deactivate instead.',
            ], 422);
        }

        // Prevent deleting categories that have children
        $childCount = $category->children()->count();
        if ($childCount > 0) {
            return response()->json([
                'message' => 'Cannot delete category with sub-categories. Deactivate instead.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}
