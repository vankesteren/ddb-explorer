export async function fetchPublicFile(filename) {
  const isProduction = import.meta.env.PROD;
  const basePath = isProduction ? '/map-explorer/' : '/';
  const response = await fetch(`${basePath}${filename}`);
  return response;
}
