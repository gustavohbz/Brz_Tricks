import { supabase } from "@/integrations/supabase/client";

export async function prepareProductPhoto(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Use JPG, PNG ou WebP de até 5 MB.");
  const image = await createImageBitmap(file);
  try {
    if (image.width * image.height > 40000000) throw new Error("A foto é muito grande.");
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Não foi possível processar a foto."); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Foto inválida.")), "image/jpeg", 0.88));
  } finally { image.close(); }
}
export async function uploadProductPhoto(blob: Blob, userId: string, productId: string) {
  const path = `${userId}/${productId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("product-photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error("Não foi possível enviar a foto."); return path;
}