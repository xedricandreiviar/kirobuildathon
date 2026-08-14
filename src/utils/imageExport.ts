import { toPng } from 'html-to-image';

export async function exportCardAsImage(
  element: HTMLElement,
  cardId: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2, // 2x resolution for print quality
  });

  const link = document.createElement('a');
  link.download = `ready-ka-ba-card-${cardId}.png`;
  link.href = dataUrl;
  link.click();
}
