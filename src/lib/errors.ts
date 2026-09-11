import { NextResponse } from "next/server";
import { PermissionError } from "@/lib/permissions";

export function handleApiError(
  error: unknown,
  fallback = "Error interno del servidor"
): NextResponse {
  if (error instanceof PermissionError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return NextResponse.json({ error: fallback }, { status: 500 });
}