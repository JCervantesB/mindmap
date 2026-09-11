import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "@/env";
import { isRateLimited } from "@/lib/rate-limit";

cloudinary.config({
  cloud_name: getEnv().CLOUDINARY_CLOUD_NAME,
  api_key: getEnv().CLOUDINARY_API_KEY,
  api_secret: getEnv().CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_UPLOADS_PER_HOUR = 20;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const env = getEnv();
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Servicio de imágenes no configurado" },
        { status: 503 }
      );
    }

    if (isRateLimited(`upload:${userId}`, MAX_UPLOADS_PER_HOUR, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiadas subidas, inténtalo más tarde" },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
      return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });
    }

    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "La imagen supera el tamaño máximo de 5 MB" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "mindmap",
      resource_type: "image",
      transformation: [{ width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }],
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Error subiendo imagen a Cloudinary:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
