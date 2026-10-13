<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteMetadata;

class SiteMetadataController extends Controller
{
    public function show()
    {
        $metadata = SiteMetadata::pluck('meta_value', 'meta_key');

        return response()->json(compact('metadata'));
    }
}
