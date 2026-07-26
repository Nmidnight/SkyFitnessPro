import { apiRequest } from '@/services/apiClient';
import type {
  Course,
  LoginPayload,
  LoginResponse,
  MessageResponse,
  RegisterPayload,
} from '@/types';

export function registerUser(payload: RegisterPayload): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    token: null,
  });
}

export function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    token: null,
  });
}

export function getCourses(): Promise<Course[]> {
  return apiRequest<Course[]>('/courses', { token: null });
}

export function getCourseById(courseId: string): Promise<Course> {
  return apiRequest<Course>(`/courses/${courseId}`, { token: null });
}

export function addCourseToUser(courseId: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/users/me/courses', {
    method: 'POST',
    body: { courseId },
  });
}

export function removeCourseFromUser(
  courseId: string,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/users/me/courses/${courseId}`, {
    method: 'DELETE',
  });
}

export function resetCourseProgress(courseId: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/courses/${courseId}/reset`, {
    method: 'PATCH',
  });
}
