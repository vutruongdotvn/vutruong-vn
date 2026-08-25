import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Lấy thông tin User-Agent (Danh tính của trình duyệt/bot)
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // 2. Danh sách các Bot cào dữ liệu rác thường dùng để phá hoại
  const blockedBots = [
    'python', 'curl', 'wget', 'scrapy', 'postman', 'insomnia', 
    'go-http-client', 'java', 'ruby', 'axios', 'node-fetch'
  ];
  
  // 3. Nếu danh tính khớp với Bot rác
  const isBot = blockedBots.some(bot => userAgent.includes(bot));

  // 4. Khóa mõm ngay lập tức nếu chúng cố vào khu vực có URL được chỉ định
  if (isBot && request.nextUrl.pathname.startsWith('/')) {
    // Trả về mã lỗi 403 (Forbidden) cực nhẹ, không tốn tài nguyên Server
    return new NextResponse('Access Denied: Bad Bot', { status: 403 });
  }

  return NextResponse.next();
}

// Chỉ chạy middleware cho các đường dẫn cụ thể để tối ưu hiệu năng
export const config = {
  matcher: ['/:path*'],
};