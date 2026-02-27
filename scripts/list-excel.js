const XLSX = require('xlsx');
const wb = XLSX.readFile('250410 하나네트워크 현황 종합판_업데이트.xlsx');
const ws = wb.Sheets['Sheet2'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

let count = 0;
for (let i = 1; i < data.length; i++) {
  const r = data[i];
  if (!r || r.length === 0) continue;
  const c0 = r[0], c1 = r[1];
  if (c0 && !c1 && !r[2] && typeof c0 === 'string' && c0.includes('(')) {
    console.log(`--- 지역: ${c0} ---`);
    continue;
  }
  if (c0 && r[3] && !String(c0).startsWith('(')) {
    count++;
    console.log(`${count}. ${c0}`);
  }
}
console.log(`\n총 ${count}개 지점`);
