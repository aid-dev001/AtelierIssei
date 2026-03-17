function buildCrcTable(): Uint32Array {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
}

const CRC_TABLE = buildCrcTable();

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function injectDpi300(dataUrl: string): string {
  const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bin = atob(b64);
  const src = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) src[i] = bin.charCodeAt(i);

  const ppm = 11811; // 300 DPI in pixels per metre (300 / 0.0254 ≈ 11811)

  // pHYs chunk = 4 (len) + 4 (type) + 9 (data) + 4 (crc) = 21 bytes
  const chunk = new Uint8Array(21);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9);
  chunk[4] = 0x70; chunk[5] = 0x48; chunk[6] = 0x59; chunk[7] = 0x73; // "pHYs"
  dv.setUint32(8, ppm);
  dv.setUint32(12, ppm);
  chunk[16] = 1; // unit = metre

  const crcVal = crc32(chunk.slice(4, 17));
  dv.setUint32(17, crcVal);

  // Insert after IHDR (8 sig + 4+4+13+4 = 33 bytes)
  const ihdrEnd = 33;
  const out = new Uint8Array(src.length + chunk.length);
  out.set(src.slice(0, ihdrEnd));
  out.set(chunk, ihdrEnd);
  out.set(src.slice(ihdrEnd), ihdrEnd + chunk.length);

  let s = "";
  for (let i = 0; i < out.length; i++) s += String.fromCharCode(out[i]);
  return "data:image/png;base64," + btoa(s);
}
