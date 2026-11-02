import { API_BASE_URL } from '@/lib/api/client';
import { getSession } from 'next-auth/react';
import type { AssessmentFile } from './types';
export async function downloadAssessmentFile(file: AssessmentFile) {
  const session = await getSession();
  const response = await fetch(`${API_BASE_URL}/assessments/files/${encodeURIComponent(file.id)}`, {
    headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
  });
  if (!response.ok) throw new Error('File could not be downloaded. Please try again.');
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
