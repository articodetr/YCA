import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploaderProps {
  bucket: string;
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
  currentImage?: string | null;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  label?: string;
}

export default function ImageUploader({
  bucket,
  onUploadSuccess,
  onRemove,
  currentImage,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  label = 'Upload Image'
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setUploading(false);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(urlData.publicUrl);
      setSuccess(true);
      onUploadSuccess(urlData.publicUrl);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Let parent clear any stored URL (optional)
    onRemove?.();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-primary mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-sand"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {success && (
              <div className="bg-green-500 text-white p-2 rounded-lg flex items-center gap-2">
                <Check size={20} />
                <span className="text-sm font-semibold">Uploaded!</span>
              </div>
            )}
            <button
              onClick={handleRemove}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-accent'
              : 'border-gray-300 hover:border-primary'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes.join(',')}
            onChange={handleChange}
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <Loader2 size={48} className="text-primary animate-spin" />
                <p className="text-primary font-semibold">Uploading...</p>
              </>
            ) : (
              <>
                <Upload size={48} className="text-gray-400" />
                <div>
                  <p className="text-primary font-semibold mb-1">
                    Drop your image here or click to browse
                  </p>
                  <p className="text-sm text-muted">
                    Max size: {maxSizeMB}MB. Accepted: JPG, PNG, WebP
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
