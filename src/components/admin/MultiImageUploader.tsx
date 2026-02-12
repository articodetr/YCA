import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Loader2, GripVertical, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MultiImageUploaderProps {
  bucket: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxSizeMB?: number;
  maxImages?: number;
  label?: string;
}

export default function MultiImageUploader({
  bucket,
  images,
  onChange,
  maxSizeMB = 5,
  maxImages = 10,
  label = 'Gallery Images',
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: JPG, PNG, WebP`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
    return null;
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = maxImages - images.length;

    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = fileArray.slice(0, remaining);
    setUploading(true);
    setError(null);

    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        newUrls.push(urlData.publicUrl);
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.message || 'Failed to upload image');
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDragZone = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDropZone = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleReorderDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleReorderDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleReorderDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        <span className="text-gray-400 font-normal ml-2">
          ({images.length}/{maxImages})
        </span>
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => handleReorderDragStart(index)}
              onDragOver={(e) => handleReorderDragOver(e, index)}
              onDrop={(e) => handleReorderDrop(e, index)}
              onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                dragOverIndex === index
                  ? 'border-emerald-500 scale-105'
                  : draggedIndex === index
                  ? 'border-gray-300 opacity-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <div className="bg-white/90 p-1.5 rounded-lg cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} className="text-gray-600" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  COVER
                </span>
              )}
            </div>
          ))}

          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-emerald-500"
            >
              {uploading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Plus size={24} />
                  <span className="text-xs font-medium">Add More</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 hover:border-emerald-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDragZone}
          onDragLeave={handleDragZone}
          onDragOver={handleDragZone}
          onDrop={handleDropZone}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <Loader2 size={40} className="text-emerald-600 animate-spin" />
                <p className="text-emerald-700 font-semibold">Uploading...</p>
              </>
            ) : (
              <>
                <Upload size={40} className="text-gray-400" />
                <div>
                  <p className="text-gray-700 font-semibold mb-1">
                    Drop images here or click to browse
                  </p>
                  <p className="text-sm text-gray-400">
                    Max {maxSizeMB}MB each. Up to {maxImages} images. JPG, PNG, WebP
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptedTypes.join(',')}
        onChange={handleChange}
        disabled={uploading}
        multiple
      />

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
