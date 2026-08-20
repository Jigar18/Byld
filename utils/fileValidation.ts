const startsWith = (buffer: Buffer, signature: number[]) =>
  signature.every((byte, index) => buffer[index] === byte);

export function isPdf(buffer: Buffer) {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

export function isSupportedImage(buffer: Buffer, contentType: string) {
  if (contentType === "image/jpeg") return startsWith(buffer, [0xff, 0xd8, 0xff]);
  if (contentType === "image/png") {
    return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (contentType === "image/webp") {
    return buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }
  return false;
}
