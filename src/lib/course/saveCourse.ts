import { apiClient } from '@/lib/api/client';

/** A saved course always updates by ID; a duplicate slug never identifies an edit. */
export function saveCourse<T>(payload: { id?: string | null; [key: string]: unknown }) {
  return payload.id
    ? apiClient.patch<T>('/course/editOrUpdate-course', payload)
    : apiClient.post<T>('/course/create-course', payload);
}
