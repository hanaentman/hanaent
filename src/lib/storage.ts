import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// 스토리지 인터페이스 (S3 전환 대비)
export interface StorageProvider {
  upload(file: Buffer, filename: string, folder: string): Promise<string>;
  delete(filePath: string): Promise<void>;
}

// 로컬 파일 시스템 저장
class LocalStorageProvider implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = path.join(process.cwd(), 'public', 'uploads');
  }

  async upload(file: Buffer, filename: string, folder: string): Promise<string> {
    const dir = path.join(this.basePath, folder);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    const ext = path.extname(filename);
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(dir, safeName);

    await writeFile(filePath, file);
    return `/uploads/${folder}/${safeName}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    try {
      await unlink(fullPath);
    } catch {
      // 파일이 이미 없으면 무시
    }
  }
}

// S3 호환 스토리지 (향후 구현)
// class S3StorageProvider implements StorageProvider { ... }

let storageProvider: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!storageProvider) {
    // 향후: if (process.env.UPLOAD_PROVIDER === 's3') { ... }
    storageProvider = new LocalStorageProvider();
  }
  return storageProvider;
}
