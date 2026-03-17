export function applyCmykSimulation(src: HTMLCanvasElement, dst: HTMLCanvasElement): void {
  dst.width = src.width;
  dst.height = src.height;
  const dCtx = dst.getContext("2d")!;
  dCtx.drawImage(src, 0, 0);
  const id = dCtx.getImageData(0, 0, dst.width, dst.height);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
    const k = 1 - Math.max(r, g, b);
    if (k < 1 - 1e-9) {
      const ik = 1 - k;
      const c = (1 - r - k) / ik;
      const m = (1 - g - k) / ik;
      const y = (1 - b - k) / ik;
      d[i]     = Math.round(255 * (1 - c) * ik);
      d[i + 1] = Math.round(255 * (1 - m) * ik);
      d[i + 2] = Math.round(255 * (1 - y) * ik);
    }
  }
  dCtx.putImageData(id, 0, 0);
}

export function simulateCmykDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const src = document.createElement("canvas");
      src.width = img.naturalWidth;
      src.height = img.naturalHeight;
      src.getContext("2d")!.drawImage(img, 0, 0);
      const dst = document.createElement("canvas");
      applyCmykSimulation(src, dst);
      resolve(dst.toDataURL("image/png"));
    };
    img.src = dataUrl;
  });
}
