export interface RemoveBackgroundResult {
  blob: Blob;
  url: string;
}

const MAX_DIMENSION = 2500;

/** Redimensiona a imagem se necessário para manter o processamento rápido e leve. */
async function normalizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  if (bitmap.width <= MAX_DIMENSION && bitmap.height <= MAX_DIMENSION) {
    bitmap.close();
    return file;
  }
  const scale = MAX_DIMENSION / Math.max(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao processar imagem"))),
      "image/png",
    );
  });
}

/** Remove o fundo da imagem inteiramente no navegador (modelo roda via WASM/ONNX). */
export async function removeImageBackground(
  file: File,
  onProgress?: (label: string, current: number, total: number) => void,
): Promise<RemoveBackgroundResult> {
  const dynamicImport = new Function(
    "specifier",
    "return import(specifier)",
  ) as <T>(specifier: string) => Promise<T>;
  const { removeBackground } = await dynamicImport<
    typeof import("@imgly/background-removal")
  >("https://esm.sh/@imgly/background-removal@1.7.0");
  const normalized = await normalizeImage(file);

  const blob = await removeBackground(normalized, {
    output: { format: "image/png", quality: 1 },
    progress: (key, current, total) => {
      onProgress?.(key, current, total);
    },
  });

  return { blob, url: URL.createObjectURL(blob) };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
