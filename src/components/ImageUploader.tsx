import { useState, useCallback } from 'react';
import { uploadImage } from '../lib/supabase/uploadImage';

interface ImageUploaderProps {
  userId: string;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxSizeMB?: number;
  acceptedTypes?: string;
}

export function ImageUploader({
  userId,
  photos,
  onPhotosChange,
  maxSizeMB = 2,
  acceptedTypes = 'image/*',
}: ImageUploaderProps): JSX.Element {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError('');

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`El archivo supera el tamaño máximo de ${maxSizeMB} MB.`);
        return;
      }

      setUploading(true);

      try {
        const url = await uploadImage(file, userId);
        onPhotosChange([...photos, url]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al subir la imagen.';
        setError(message);
      } finally {
        setUploading(false);
        if (e.target) e.target.value = '';
      }
    },
    [maxSizeMB, photos, onPhotosChange, userId],
  );

  const handleRemove = useCallback(
    (index: number): void => {
      onPhotosChange(photos.filter((_, i) => i !== index));
    },
    [photos, onPhotosChange],
  );

  return (
    <div className="image-uploader space-y-2">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url, index) => (
            <div key={url} className="relative group">
              <img src={url} alt={`Producto imagen ${index + 1}`} className="w-20 h-20 object-cover rounded" />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Eliminar imagen ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        className={`flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-500 rounded cursor-pointer hover:border-emerald-400 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          disabled={uploading}
          hidden
        />
        {uploading ? <span>Subiendo imagen...</span> : <span>Haz clic o arrastra una imagen aquí</span>}
      </label>

      {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
    </div>
  );
}
