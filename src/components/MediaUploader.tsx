import React from 'react';
import { Image, Video, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import DocumentUploader from './DocumentUploader';

interface MediaUploaderProps {
  images?: string[];
  onImagesChange?: (images: string[]) => void;
  video?: string;
  onVideoChange?: (video: string | null) => void;
  documents?: string[];
  onDocumentsChange?: (documents: string[]) => void;
  maxImages?: number;
  maxVideoSizeMB?: number;
  maxDocuments?: number;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  images = [],
  onImagesChange,
  video,
  onVideoChange,
  documents = [],
  onDocumentsChange,
  maxImages = 10,
  maxVideoSizeMB = 50,
  maxDocuments = 5,
}) => {
  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-slate-800">
        <TabsTrigger value="images" className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          <span>Photos ({images.length})</span>
        </TabsTrigger>
        <TabsTrigger value="video" className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          <span>Video</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Documents</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="images" className="mt-4">
        <ImageUploader
          initialImages={images}
          onImagesChange={onImagesChange || (() => {})}
          maxImages={maxImages}
          label="Upload Photos"
        />
      </TabsContent>

      <TabsContent value="video" className="mt-4">
        <VideoUploader
          initialVideo={video}
          onVideoChange={onVideoChange || (() => {})}
          label="Upload Video"
        />
      </TabsContent>

      <TabsContent value="documents" className="mt-4">
        <DocumentUploader
          initialDocuments={documents}
          onDocumentsChange={onDocumentsChange || (() => {})}
          label="Upload Documents"
        />
      </TabsContent>
    </Tabs>
  );
};

export default MediaUploader;
