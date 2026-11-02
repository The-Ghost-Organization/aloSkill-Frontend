import { getServerSession } from 'next-auth';
import { type NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return new NextResponse('Please sign in to download lesson files.', { status: 401 });
  const { courseId, lessonId } = await params;
  const index = request.nextUrl.searchParams.get('file');
  if (index === null || !/^\d+$/.test(index) || !Number.isSafeInteger(Number(index)))
    return new NextResponse('Invalid attachment.', { status: 400 });
  try {
    const response = await fetch(`${API_BASE_URL}/course/private/attachments/${encodeURIComponent(courseId)}/${encodeURIComponent(lessonId)}?file=${index}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }, cache: 'no-store', signal: AbortSignal.timeout(65_000), redirect: 'error',
    });
    if (!response.ok) {
      let message = response.status === 404
        ? 'Attachment or download endpoint not found. Ensure the backend attachment update is installed.'
        : `Attachment download failed (HTTP ${response.status}).`;
      if (response.headers.get('content-type')?.includes('application/json')) {
        const body = await response.json() as { message?: string };
        if (body.message) message = body.message;
      }
      return new NextResponse(message, { status: response.status });
    }
    if (!response.body) return new NextResponse('The backend returned an empty file response.', { status: 502 });
    const headers = new Headers({ 'Content-Type': 'application/octet-stream', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    headers.set('Content-Disposition', response.headers.get('content-disposition') || 'attachment');
    return new NextResponse(response.body, { headers });
  } catch {
    return new NextResponse('The frontend server could not reach the attachment download service. Check that the backend is running and NEXT_PUBLIC_BACKEND_API_URL is reachable from the frontend server.', { status: 502 });
  }
}
