import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">하나이비인후과네트워크</h3>
            <p className="text-gray-600 text-sm">
              전국 병·의원에서 이비인후과 전문 진료를 제공합니다.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">바로가기</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/clinics" className="hover:text-primary-600">가까운곳 찾기</Link></li>
              <li><Link href="/search" className="hover:text-primary-600">통합 검색</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">고객센터</h4>
            <p className="text-sm text-gray-600">
              대표전화: 1588-0000<br />
              운영시간: 평일 09:00 - 18:00
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} 하나이비인후과네트워크. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
