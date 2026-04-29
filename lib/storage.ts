"use client";

import { createClient } from "@/lib/supabase/client";

export const PRODUCT_IMAGES_BUCKET = "product-images";
export const PRODUCT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

const PRODUCT_IMAGE_EXTENSIONS: Record<
  (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number],
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type ProductImageUpload = {
  path: string;
  publicUrl: string;
};

function isAllowedProductImageType(
  type: string,
): type is (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number] {
  return PRODUCT_IMAGE_ALLOWED_TYPES.includes(
    type as (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number],
  );
}

function validateProductImage(
  file: File,
): (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number] {
  if (file.size === 0) {
    throw new Error("Choose an image file before uploading.");
  }

  if (!isAllowedProductImageType(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, or AVIF image.");
  }

  if (file.size > PRODUCT_IMAGE_MAX_SIZE_BYTES) {
    throw new Error("Product images must be 5MB or smaller.");
  }

  return file.type;
}

function createProductImagePath(
  fileType: (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number],
) {
  const extension = PRODUCT_IMAGE_EXTENSIONS[fileType];
  return `products/${crypto.randomUUID()}.${extension}`;
}

export async function uploadProductImage(
  file: File,
): Promise<ProductImageUpload> {
  const fileType = validateProductImage(file);

  const supabase = createClient();
  const path = createProductImagePath(fileType);
  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: fileType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Could not upload the product image.");
  }

  const uploadedPath = data.path;
  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(uploadedPath);

  if (!publicUrl) {
    throw new Error("The product image uploaded, but no public URL was returned.");
  }

  return {
    path: uploadedPath,
    publicUrl,
  };
}
