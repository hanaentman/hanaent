import { z } from 'zod';
import { externalUrl } from './url';

export const clinicSchema = z.object({
  name: z.string().min(1, '지점명을 입력해주세요.'),
  slug: z.string().min(1, 'URL 슬러그를 입력해주세요.').regex(/^[a-z0-9-]+$/, '슬러그는 영소문자, 숫자, 하이픈만 허용됩니다.'),
  region: z.string().min(1, '지역을 입력해주세요.'),
  address: z.string().min(1, '주소를 입력해주세요.'),
  phone: z.string().min(1, '전화번호를 입력해주세요.'),
  intro: z.string().optional().default(''),
  tags: z.string().optional().default('[]'),
  hours: z.string().optional().default('{}'),
  transport: z.string().optional().default(''),
  parking: z.string().optional().default(''),
  mapUrl: z.string().optional().default(''),
  websiteUrl: z.string().optional().default('').transform(externalUrl),
  blogUrl: z.string().optional().default('').transform(externalUrl),
  sortOrder: z.number().optional().default(0),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

export const clinicUpdateSchema = clinicSchema.partial().omit({ slug: true });

export const doctorSchema = z.object({
  clinicId: z.string().min(1, '지점을 선택해주세요.'),
  name: z.string().min(1, '의료진 이름을 입력해주세요.'),
  title: z.string().optional().default(''),
  specialties: z.string().optional().default('[]'),
  bio: z.string().optional().default(''),
  photoUrl: z.string().optional().default(''),
  sortOrder: z.number().optional().default(0),
});

export const adminUserSchema = z.object({
  username: z.string().min(3, '아이디는 3자 이상이어야 합니다.').regex(/^[a-zA-Z0-9_]+$/, '아이디는 영문, 숫자, 밑줄만 허용됩니다.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
  role: z.enum(['SUPER_ADMIN', 'CLINIC_ADMIN']),
  clinicId: z.string().optional().nullable(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, '검색어를 입력해주세요.').max(100, '검색어가 너무 깁니다.'),
  limit: z.coerce.number().min(1).max(50).optional().default(8),
});

export const loginSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});
