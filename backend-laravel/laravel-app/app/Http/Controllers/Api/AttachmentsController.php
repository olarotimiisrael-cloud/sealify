<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MessageAttachment;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AttachmentsController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'conversation_id' => 'required|string|max:100',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $conversationId = $data['conversation_id'];

        // Store file
        $path = $file->store('attachments/' . $conversationId, 'public');
        
        $attachment = MessageAttachment::create([
            'conversation_id' => $conversationId,
            'filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'path' => $path,
            'storage_bucket' => 'public',
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json($attachment, 201);
    }

    public function show(string $id)
    {
        $attachment = MessageAttachment::findOrFail($id);
        
        // Check if user has access to this conversation
        // (This would require checking conversation participants)
        
        return response()->json($attachment);
    }

    public function download(string $id)
    {
        $attachment = MessageAttachment::findOrFail($id);
        
        // Check permissions...
        
        $fullPath = Storage::disk('public')->path($attachment->path);
        
        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->download($fullPath, $attachment->filename, [
            'Content-Type' => $attachment->mime_type,
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $attachment = MessageAttachment::findOrFail($id);
        
        // Check if user owns this attachment
        if ($attachment->uploaded_by !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Storage::disk('public')->delete($attachment->path);
        $attachment->delete();

        return response()->json(['success' => true]);
    }
}