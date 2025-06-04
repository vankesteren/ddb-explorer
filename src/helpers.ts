export async function fetchPublicFile(filename: string): Promise<File> {
  const isProduction = import.meta.env.PROD;
  const basePath = isProduction ? '/map-explorer/' : '/';
  const response = await fetch(`${basePath}${filename}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}


export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file as text'))
      }
    }

    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

