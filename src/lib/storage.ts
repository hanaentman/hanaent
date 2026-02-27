import { put, del } from '@vercel/blob';

// 스토리지 인터페이스 (S3 전환 대비)
export interface StorageProvider {
  upload(file: Buffer, filename: string, folder: string): Promise<string>;
  delete(filePath: string): Promise<void>;
}

// Vercel Blob 스토리지
class VercelBlobStorageProvider implements StorageProvider {
  async upload(file: Buffer, filename: string, folder: string): Promise<string> {
    const ext = filename.split('.').pop() || 'jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const pathname = `${folder}/${safeName}`;

    const blob = await put(pathname, file, {
      access: 'public',
      contentType: this.getContentType(ext),
    });

    return blob.url;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      await del(fileUrl);
    } catch {
      // 파일이 이미 없으면 무시
    }
  }

  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    return types[ext.toLowerCase()] || 'image/jpeg';
  }
}

let storageProvider: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!storageProvider) {
    storageProvider = new VercelBlobStorageProvider();
  }
  return storageProvider;
}
