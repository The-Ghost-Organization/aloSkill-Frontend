import type { CourseType } from '../../app/(withoutSidebarLayout)/courses/allCourses.types';
import { apiClient } from '../api/client';
import { courseDraftStorage } from '../storage/courseDraftStorage';

export const getAllCourses = async (userId?: string) => {
  try {
    const response = await apiClient.get<CourseType[]>(
      `/course/public/allCourses?userId=${userId ? userId : ""}`
    );
    if (response.success) {
      return response;
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const courseAddToCartHandler = (courseId: string) => {
  const getStorageData = courseDraftStorage.get<{ courseId: string; quantity: number }[]>() || [];
  if (getStorageData?.find(item => item.courseId === courseId)) return getStorageData;
  getStorageData?.push({ courseId, quantity: 1 });
  courseDraftStorage.save(getStorageData);
  return getStorageData;
};
