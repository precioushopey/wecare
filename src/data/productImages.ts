/**
 * Resolves product photos in `src/assets/products/` at build time.
 * Look up by exact filename (Unicode-normalised for accented names).
 */
const modules = import.meta.glob<string>("../assets/products/*.png", {
  eager: true,
  import: "default",
});

const norm = (s: string) => s.normalize("NFC");

const byFile: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split("/").pop();
  if (file) byFile[norm(file)] = url;
}

export function productImage(file: string): string | undefined {
  return byFile[norm(file)];
}
