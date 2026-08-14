/**
 * Copies the given text to the system clipboard.
 * Uses the Clipboard API with feature detection.
 *
 * @param text - The text string to copy to the clipboard.
 * @returns A promise that resolves to `true` if the copy succeeded, or `false` if the Clipboard API is unavailable.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
