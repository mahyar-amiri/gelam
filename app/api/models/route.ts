import { NextResponse } from "next/server";
import { writeFile, readdir, mkdir } from "fs/promises";
import { join } from "path";

const modelsDir = join(process.cwd(), "public", "models");

export async function GET() {
  try {
    // Ensure directory exists
    await mkdir(modelsDir, { recursive: true });
    const files = await readdir(modelsDir);
    // Filter only 3D models
    const models = files.filter((f) => f.endsWith(".glb") || f.endsWith(".gltf"));
    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read models directory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await mkdir(modelsDir, { recursive: true });
    const path = join(modelsDir, file.name);
    
    // Save file to public/models
    await writeFile(path, buffer);

    return NextResponse.json({ success: true, name: file.name });
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload model" }, { status: 500 });
  }
}