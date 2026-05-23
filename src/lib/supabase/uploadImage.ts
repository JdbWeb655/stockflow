import { supabase } from '../supabase';

const UPLOAD_TIMEOUT_MS = 15000;

/**
 * Uploads a File to Supabase Storage (public bucket `product-images`).
 * Path: product-images/{userId}/{filename}
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  const path = `${userId}/${fileName}`;

  const uploadPromise = supabase.storage.from('product-images').upload(path, file);

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('La subida de imagen excedió el tiempo límite.')), UPLOAD_TIMEOUT_MS);
  });

  const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

  if (error) {
    const message = `Error al subir imagen: ${error.message}`;
    throw new Error(message);
  }

  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
  if (!urlData?.publicUrl) {
    throw new Error('No se pudo generar la URL pública de la imagen.');
  }

  return urlData.publicUrl;
}
