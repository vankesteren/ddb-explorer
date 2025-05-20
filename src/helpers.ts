export async function fetchPublicFile(filename) {
  const isProduction = import.meta.env.PROD;
  const basePath = isProduction ? '/map-explorer/' : '/';
  const response = await fetch(`${basePath}${filename}`);
  return response;
}

export function readFileAsText(file): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)

    reader.readAsText(file)
  })
}
