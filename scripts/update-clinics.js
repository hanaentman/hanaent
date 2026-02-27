const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function toSlug(name) {
  const map = {
    '강동': 'gangdong', '강서': 'gangseo', '광화문': 'gwanghwamun', '노원': 'nowon',
    '디엠씨': 'dmc', '명동': 'myeongdong', '목동': 'mokdong', '성수': 'seongsu',
    '신도림': 'sindorim', '옥수': 'oksu', '용산': 'yongsan', '잠실': 'jamsil',
    '경기광주': 'gwangju-gyeonggi', '고잔': 'gojan', '김포': 'gimpo', '남양': 'namyang',
    '남양주': 'namyangju', '다산': 'dasan', '동탄': 'dongtan', '미사': 'misa',
    '부천': 'bucheon', '북수원': 'buk-suwon', '분당': 'bundang', '수원': 'suwon',
    '수지': 'suji', '위례': 'wirye', '의정부': 'uijeongbu', '이천': 'icheon',
    '탄현': 'tanhyeon', '파주': 'paju',
    '대전': 'daejeon', '서산': 'seosan', '서청주': 'seo-cheongju', '충주': 'chungju', '홍성': 'hongseong',
    '구미': 'gumi', '부산': 'busan', '상주': 'sangju', '울산': 'ulsan', '창원': 'changwon',
    '광주': 'gwangju', '김제': 'gimje', '순천': 'suncheon',
  };
  return map[name.trim()] || name.trim().toLowerCase().replace(/\s+/g, '-');
}

function getRegion(rowIdx, data) {
  // 지역 헤더 행을 찾아서 해당 지점의 지역 반환
  const regionHeaders = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row && row[0] && !row[1] && !row[2] && typeof row[0] === 'string' && row[0].includes('(')) {
      regionHeaders.push({ idx: i, region: row[0].split('(')[0].trim() });
    }
  }
  let region = '기타';
  for (const h of regionHeaders) {
    if (rowIdx > h.idx) region = h.region;
  }
  return region;
}

async function main() {
  const wb = XLSX.readFile('250410 하나네트워크 현황 종합판_업데이트.xlsx');
  const ws = wb.Sheets['Sheet2'];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // 기존 데이터 삭제
  await prisma.clinicImage.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.clinic.deleteMany();
  console.log('기존 데이터 삭제 완료');

  // 파싱: 지점별로 그룹핑 (첫 칸에 지점명이 있으면 새 지점, 없으면 추가 의료진)
  const clinics = [];
  let current = null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const col0 = row[0];
    const col1 = row[1]; // 의료진

    // 지역 헤더 행 (예: "서울 (12)")
    if (col0 && !col1 && !row[2] && typeof col0 === 'string' && col0.includes('(')) {
      continue;
    }

    // 새 지점 행: 첫 칸에 지점명 + 전화번호 존재
    if (col0 && row[3]) {
      const branchName = col0.toString().trim();
      // (덕소) 같은 부가 행은 건너뜀
      if (branchName.startsWith('(')) {
        // 추가 의료진으로 처리
        if (current && col1) {
          current.doctors.push({ name: col1.toString().trim(), training: row[10] ? row[10].toString().trim() : '' });
        }
        continue;
      }

      const region = getRegion(i, data);
      current = {
        branchName,
        slug: toSlug(branchName),
        region,
        phone: row[3] ? row[3].toString().trim() : '',
        address: row[5] ? row[5].toString().trim() : '',
        zip: row[2] ? row[2].toString().trim() : '',
        openDate: row[7] ? row[7].toString() : '',
        email: row[9] ? row[9].toString().trim() : '',
        doctors: [],
      };
      if (col1) {
        current.doctors.push({
          name: col1.toString().trim(),
          phone: row[4] ? row[4].toString().trim() : '',
          training: row[10] ? row[10].toString().trim() : '',
        });
      }
      clinics.push(current);
    } else if (!col0 && col1 && current) {
      // 추가 의료진 행
      current.doctors.push({
        name: col1.toString().trim(),
        phone: row[4] ? row[4].toString().trim() : '',
        training: row[10] ? row[10].toString().trim() : '',
      });
    }
  }

  console.log(`\n총 ${clinics.length}개 지점 파싱 완료\n`);

  // DB에 저장
  for (const c of clinics) {
    const fullName = `하나이비인후과 ${c.branchName}점`;
    const intro = `${c.region} ${c.branchName} 지역에 위치한 ${fullName}입니다. 이비인후과 전문 진료를 제공합니다.`;

    const clinic = await prisma.clinic.create({
      data: {
        slug: c.slug,
        name: fullName,
        region: c.region,
        address: c.address,
        phone: c.phone,
        intro,
        tags: JSON.stringify(['이비인후과', '비염', '축농증']),
        hours: JSON.stringify({ '월~금': '09:00 - 18:00', '토': '09:00 - 13:00', '일/공휴일': '휴진' }),
        transport: '',
        parking: '',
      },
    });

    // 의료진 저장
    for (let di = 0; di < c.doctors.length; di++) {
      const d = c.doctors[di];
      const title = di === 0 ? '원장' : '전문의';
      const specialties = ['이비인후과'];
      const bio = d.training ? `수련: ${d.training}` : '';

      await prisma.doctor.create({
        data: {
          clinicId: clinic.id,
          name: d.name,
          title,
          specialties: JSON.stringify(specialties),
          bio,
          sortOrder: di,
        },
      });
    }

    console.log(`  ✅ ${fullName} (의료진 ${c.doctors.length}명)`);
  }

  // SUPER_ADMIN 계정 생성
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('hana1120@@', 12);
  await prisma.adminUser.create({
    data: { username: 'hanaent', passwordHash: hash, role: 'SUPER_ADMIN', isActive: true },
  });
  console.log('\n✅ SUPER_ADMIN 계정 생성: hanaent');

  // 각 지점별 CLINIC_ADMIN 계정 생성
  const allClinics = await prisma.clinic.findMany({ orderBy: { createdAt: 'asc' } });
  const clinicPw = await bcrypt.hash('clinic1234', 12);
  for (const cl of allClinics) {
    await prisma.adminUser.create({
      data: {
        username: `admin_${cl.slug}`,
        passwordHash: clinicPw,
        role: 'CLINIC_ADMIN',
        clinicId: cl.id,
        isActive: true,
      },
    });
  }
  console.log(`✅ CLINIC_ADMIN 계정 ${allClinics.length}개 생성 (비밀번호: clinic1234)`);

  console.log('\n🎉 업데이트 완료!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
