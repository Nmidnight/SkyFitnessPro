import { apiRequest } from '@/services/apiClient';
import type {
  CourseProgress,
  MessageResponse,
  SaveProgressPayload,
  Workout,
  WorkoutProgress,
} from '@/types';

export function getCourseWorkouts(courseId: string): Promise<Workout[]> {
  return apiRequest<Workout[]>(`/courses/${courseId}/workouts`);
}

export function getWorkoutById(workoutId: string): Promise<Workout> {
  return apiRequest<Workout>(`/workouts/${workoutId}`);
}

export async function getCourseProgress(
  courseId: string,
): Promise<CourseProgress> {
  const data = await apiRequest<
    CourseProgress & { workoutsProgress?: WorkoutProgress[] }
  >(`/users/me/progress?courseId=${courseId}`);

  return {
    courseId: data.courseId ?? courseId,
    courseCompleted: Boolean(data.courseCompleted),
    workoutsProgress: data.workoutsProgress ?? [],
  };
}

export async function getWorkoutProgress(
  courseId: string,
  workoutId: string,
): Promise<WorkoutProgress> {
  const data = await apiRequest<
    WorkoutProgress & { progressData?: number[] }
  >(`/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`);

  return {
    workoutId: data.workoutId ?? workoutId,
    workoutCompleted: Boolean(data.workoutCompleted),
    progressData: data.progressData ?? [],
  };
}

export function saveWorkoutProgress(
  courseId: string,
  workoutId: string,
  payload: SaveProgressPayload,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(
    `/courses/${courseId}/workouts/${workoutId}`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

export function resetWorkoutProgress(
  courseId: string,
  workoutId: string,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(
    `/courses/${courseId}/workouts/${workoutId}/reset`,
    {
      method: 'PATCH',
    },
  );
}
