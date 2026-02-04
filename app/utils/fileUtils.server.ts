/**
 * Server-only utility functions for file handling
 * These functions use Node.js APIs like Buffer and should only be used in server contexts (actions, loaders)
 */

/**
 * Converts a File or Blob to a base64 data URL string
 * Works in Node.js/React Router server environments
 */
export const fileToBase64 = async (file: File | Blob): Promise<string> => {
  const stream = file.stream()
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const buffer = Buffer.concat(chunks)
  const mimeType = file instanceof File ? file.type : 'application/octet-stream'

  return `data:${mimeType};base64,${buffer.toString('base64')}`
}
