import QRCode from 'qrcode';

export async function generateQRDataURL(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
}
