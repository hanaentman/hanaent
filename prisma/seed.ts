import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface ClinicSeed {
  slug: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  intro: string;
  tags: string[];
  hours: Record<string, string>;
  transport: string;
  parking: string;
}

const clinicsData: ClinicSeed[] = [
  // ─── 실제 데이터 5개 ───
  {
    slug: 'gangnam',
    name: '하나이비인후과 강남점',
    region: '서울',
    address: '서울특별시 강남구 테헤란로 152 강남파이낸스센터 3층',
    phone: '02-555-0101',
    intro: '강남역 1번 출구에서 도보 3분 거리에 위치한 하나이비인후과 강남점입니다. 최신 진료 장비와 풍부한 임상 경험으로 이비인후과 전문 진료를 제공합니다.',
    tags: ['코질환', '알레르기', '수면무호흡', '소아이비인후과'],
    hours: { '월~금': '09:00 - 18:30', '토': '09:00 - 13:00', '일/공휴일': '휴진', '점심': '13:00 - 14:00' },
    transport: '강남역 1번 출구 도보 3분',
    parking: '건물 지하주차장 이용 (2시간 무료)',
  },
  {
    slug: 'jamsil',
    name: '하나이비인후과 잠실점',
    region: '서울',
    address: '서울특별시 송파구 올림픽로 300 롯데월드타워 5층',
    phone: '02-420-0102',
    intro: '잠실역에서 직접 연결되는 롯데월드타워 내에 위치합니다. 편리한 교통과 쾌적한 환경에서 진료를 받으실 수 있습니다.',
    tags: ['비염', '축농증', '어지럼증', '청각'],
    hours: { '월~금': '09:00 - 18:00', '토': '09:00 - 13:00', '일/공휴일': '휴진', '점심': '12:30 - 13:30' },
    transport: '잠실역 1번 출구 롯데월드타워 직결',
    parking: '롯데월드타워 지하주차장 이용',
  },
  {
    slug: 'haeundae',
    name: '하나이비인후과 해운대점',
    region: '부산',
    address: '부산광역시 해운대구 해운대로 570번길 50 해운대메디컬빌딩 4층',
    phone: '051-740-0103',
    intro: '해운대 중심에 위치한 하나이비인후과 해운대점입니다. 부산 지역 최고의 이비인후과 전문 진료를 제공합니다.',
    tags: ['코골이', '수면', '알레르기', '소아'],
    hours: { '월~금': '09:00 - 18:00', '토': '09:00 - 13:00', '일/공휴일': '휴진' },
    transport: '해운대역 3번 출구 도보 5분',
    parking: '건물 내 주차장 (1시간 무료)',
  },
  {
    slug: 'bundang',
    name: '하나이비인후과 분당점',
    region: '경기',
    address: '경기도 성남시 분당구 불정로 6 분당스퀘어 7층',
    phone: '031-710-0104',
    intro: '분당 정자역 인근에 위치한 하나이비인후과 분당점입니다. 경기 남부 지역의 이비인후과 전문 의료기관입니다.',
    tags: ['비염', '축농증', '편도', '코성형'],
    hours: { '월~금': '09:00 - 18:30', '토': '09:00 - 13:00', '일/공휴일': '휴진', '점심': '13:00 - 14:00' },
    transport: '정자역 4번 출구 도보 7분',
    parking: '건물 지하주차장 2시간 무료',
  },
  {
    slug: 'daejeon',
    name: '하나이비인후과 대전점',
    region: '대전',
    address: '대전광역시 서구 둔산로 100 타임월드 시티 3층',
    phone: '042-480-0105',
    intro: '대전 둔산동 중심에 위치한 하나이비인후과 대전점입니다. 대전·세종·충청 지역 환자분들께 전문 진료를 제공합니다.',
    tags: ['알레르기', '비염', '어지럼증', '보청기'],
    hours: { '월~금': '09:00 - 18:00', '토': '09:00 - 13:00', '일/공휴일': '휴진' },
    transport: '둔산역 5번 출구 도보 3분',
    parking: '타임월드 주차장 이용',
  },
  // ─── 템플릿 지점 37개 ───
  ...generateTemplates(),
];

function generateTemplates(): ClinicSeed[] {
  const branches = [
    { slug: 'hongdae', name: '홍대점', region: '서울', addr: '서울특별시 마포구 양화로 188' },
    { slug: 'sinchon', name: '신촌점', region: '서울', addr: '서울특별시 서대문구 신촌로 120' },
    { slug: 'yeongdeungpo', name: '영등포점', region: '서울', addr: '서울특별시 영등포구 경인로 846' },
    { slug: 'nowon', name: '노원점', region: '서울', addr: '서울특별시 노원구 상계로 65' },
    { slug: 'gwanghwamun', name: '광화문점', region: '서울', addr: '서울특별시 종로구 세종대로 175' },
    { slug: 'mokdong', name: '목동점', region: '서울', addr: '서울특별시 양천구 목동동로 293' },
    { slug: 'guro', name: '구로점', region: '서울', addr: '서울특별시 구로구 디지털로 300' },
    { slug: 'gangbuk', name: '강북점', region: '서울', addr: '서울특별시 강북구 도봉로 315' },
    { slug: 'gwanak', name: '관악점', region: '서울', addr: '서울특별시 관악구 관악로 145' },
    { slug: 'songdo', name: '송도점', region: '인천', addr: '인천광역시 연수구 송도과학로 32' },
    { slug: 'bupyeong', name: '부평점', region: '인천', addr: '인천광역시 부평구 부평대로 166' },
    { slug: 'suwon', name: '수원점', region: '경기', addr: '경기도 수원시 영통구 광교로 145' },
    { slug: 'ilsan', name: '일산점', region: '경기', addr: '경기도 고양시 일산서구 중앙로 1305' },
    { slug: 'yongin', name: '용인점', region: '경기', addr: '경기도 용인시 수지구 포은대로 435' },
    { slug: 'anyang', name: '안양점', region: '경기', addr: '경기도 안양시 동안구 시민대로 230' },
    { slug: 'pyeongtaek', name: '평택점', region: '경기', addr: '경기도 평택시 평택로 55' },
    { slug: 'daegu-suseong', name: '대구수성점', region: '대구', addr: '대구광역시 수성구 달구벌대로 2500' },
    { slug: 'daegu-dongseong', name: '대구동성로점', region: '대구', addr: '대구광역시 중구 동성로 50' },
    { slug: 'busan-seomyeon', name: '부산서면점', region: '부산', addr: '부산광역시 부산진구 중앙대로 680' },
    { slug: 'busan-sasang', name: '부산사상점', region: '부산', addr: '부산광역시 사상구 사상로 200' },
    { slug: 'gwangju-sangmu', name: '광주상무점', region: '광주', addr: '광주광역시 서구 상무중앙로 110' },
    { slug: 'gwangju-cheomdan', name: '광주첨단점', region: '광주', addr: '광주광역시 광산구 첨단과기로 208' },
    { slug: 'ulsan', name: '울산점', region: '울산', addr: '울산광역시 남구 삼산로 266' },
    { slug: 'sejong', name: '세종점', region: '세종', addr: '세종특별자치시 한누리대로 2130' },
    { slug: 'chuncheon', name: '춘천점', region: '강원', addr: '강원도 춘천시 중앙로 62' },
    { slug: 'wonju', name: '원주점', region: '강원', addr: '강원도 원주시 원일로 88' },
    { slug: 'cheongju', name: '청주점', region: '충북', addr: '충청북도 청주시 상당구 상당로 100' },
    { slug: 'cheonan', name: '천안점', region: '충남', addr: '충청남도 천안시 동남구 만남로 55' },
    { slug: 'jeonju', name: '전주점', region: '전북', addr: '전라북도 전주시 덕진구 기린대로 460' },
    { slug: 'yeosu', name: '여수점', region: '전남', addr: '전라남도 여수시 좌수영로 100' },
    { slug: 'mokpo', name: '목포점', region: '전남', addr: '전라남도 목포시 영산로 200' },
    { slug: 'pohang', name: '포항점', region: '경북', addr: '경상북도 포항시 북구 중앙로 120' },
    { slug: 'gumi', name: '구미점', region: '경북', addr: '경상북도 구미시 인동중앙로 55' },
    { slug: 'changwon', name: '창원점', region: '경남', addr: '경상남도 창원시 성산구 상남로 80' },
    { slug: 'gimhae', name: '김해점', region: '경남', addr: '경상남도 김해시 가야로 250' },
    { slug: 'jinju', name: '진주점', region: '경남', addr: '경상남도 진주시 진양호로 200' },
    { slug: 'jeju', name: '제주점', region: '제주', addr: '제주특별자치도 제주시 연삼로 473' },
  ];

  const tagSets = [
    ['비염', '축농증', '코골이'],
    ['알레르기', '소아이비인후과', '편도'],
    ['수면무호흡', '어지럼증', '청각'],
    ['비염', '알레르기', '코성형'],
    ['소아', '비염', '중이염'],
  ];

  return branches.map((b, i) => ({
    slug: b.slug,
    name: `하나이비인후과 ${b.name}`,
    region: b.region,
    address: b.addr,
    phone: `0${Math.floor(Math.random() * 9) + 2}-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    intro: `${b.region} ${b.name.replace('점', '')} 지역에 위치한 하나이비인후과 ${b.name}입니다. 이비인후과 전문 진료를 제공합니다.`,
    tags: tagSets[i % tagSets.length],
    hours: { '월~금': '09:00 - 18:00', '토': '09:00 - 13:00', '일/공휴일': '휴진' },
    transport: `인근 지하철/버스 이용`,
    parking: '건물 내 주차 가능',
  }));
}

const doctorsData = [
  { clinicSlug: 'gangnam', name: '김하나', title: '원장', specialties: ['코질환', '알레르기성비염', '수면무호흡'], bio: '서울대 의과대학 졸업, 이비인후과 전문의' },
  { clinicSlug: 'gangnam', name: '이진수', title: '부원장', specialties: ['소아이비인후과', '편도', '중이염'], bio: '연세대 의과대학 졸업, 이비인후과 전문의' },
  { clinicSlug: 'jamsil', name: '박세진', title: '원장', specialties: ['비염', '축농증', '어지럼증'], bio: '고려대 의과대학 졸업, 이비인후과 전문의' },
  { clinicSlug: 'haeundae', name: '최민호', title: '원장', specialties: ['코골이', '수면장애', '알레르기'], bio: '부산대 의과대학 졸업, 이비인후과 전문의' },
  { clinicSlug: 'bundang', name: '정유나', title: '원장', specialties: ['비염', '축농증', '코성형'], bio: '가톨릭대 의과대학 졸업, 이비인후과 전문의' },
  { clinicSlug: 'daejeon', name: '한상우', title: '원장', specialties: ['알레르기', '보청기', '어지럼증'], bio: '충남대 의과대학 졸업, 이비인후과 전문의' },
];

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 기존 데이터 삭제
  await prisma.clinicImage.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.clinic.deleteMany();

  // 1) 지점 생성
  for (const c of clinicsData) {
    await prisma.clinic.create({
      data: {
        slug: c.slug,
        name: c.name,
        region: c.region,
        address: c.address,
        phone: c.phone,
        intro: c.intro,
        tags: JSON.stringify(c.tags),
        hours: JSON.stringify(c.hours),
        transport: c.transport,
        parking: c.parking,
      },
    });
  }
  console.log(`  ✅ 지점 ${clinicsData.length}개 생성 완료`);

  // 2) 의료진 생성
  for (const d of doctorsData) {
    const clinic = await prisma.clinic.findUnique({ where: { slug: d.clinicSlug } });
    if (clinic) {
      await prisma.doctor.create({
        data: {
          clinicId: clinic.id,
          name: d.name,
          title: d.title,
          specialties: JSON.stringify(d.specialties),
          bio: d.bio,
        },
      });
    }
  }
  console.log(`  ✅ 의료진 ${doctorsData.length}명 생성 완료`);

  // 3) SUPER_ADMIN 생성
  const superUsername = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
  const superPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin1234!';
  const superHash = await bcrypt.hash(superPassword, 12);

  await prisma.adminUser.create({
    data: {
      username: superUsername,
      passwordHash: superHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`  ✅ SUPER_ADMIN 계정 생성: ${superUsername}`);

  // 4) 각 지점별 CLINIC_ADMIN 생성 (처음 5개 지점만)
  const sampleClinics = await prisma.clinic.findMany({ take: 5, orderBy: { createdAt: 'asc' } });
  for (const clinic of sampleClinics) {
    const pw = await bcrypt.hash('clinic1234', 12);
    await prisma.adminUser.create({
      data: {
        username: `admin_${clinic.slug}`,
        passwordHash: pw,
        role: 'CLINIC_ADMIN',
        clinicId: clinic.id,
      },
    });
  }
  console.log(`  ✅ CLINIC_ADMIN 샘플 계정 ${sampleClinics.length}개 생성 (비밀번호: clinic1234)`);

  console.log('\n🎉 시드 완료!');
  console.log('─────────────────────────────');
  console.log(`SUPER_ADMIN: ${superUsername} / ${superPassword}`);
  console.log('CLINIC_ADMIN 예시: admin_gangnam / clinic1234');
  console.log('─────────────────────────────');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
