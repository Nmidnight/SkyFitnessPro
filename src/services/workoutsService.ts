import { apiRequest } from '@/services/apiClient';
import type {
  CourseProgress,
  MessageResponse,
  SaveProgressPayload,
  Workout,
  WorkoutProgress,
} from '@/types';

export async function getCourseWorkouts(courseId: string): Promise<Workout[]> {
  const data = await apiRequest<Workout[] | { workouts: Workout[] }>(
    `/courses/${courseId}/workouts`,
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object' && Array.isArray(data.workouts)) {
    return data.workouts;
  }

  return [];
}

export function getWorkoutById(workoutId: string): Promise<Workout> {
  return apiRequest<Workout>(`/workouts/${workoutId}`);
}

export async function getCourseProgress(
  courseId: string,
): Promise<CourseProgress> {
  const data = await apiRequest<
    | (CourseProgress & { workoutsProgress?: WorkoutProgress[] })
    | { progress: CourseProgress }
  >(`/users/me/progress?courseId=${courseId}`);

  const progress =
    data && typeof data === 'object' && 'progress' in data
      ? data.progress
      : data;

  return {
    courseId: progress.courseId ?? courseId,
    courseCompleted: Boolean(progress.courseCompleted),
    workoutsProgress: progress.workoutsProgress ?? [],
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
