import type { Course, CourseProgress, Workout, WorkoutProgress } from '@/types';

function isWorkoutDone(
  workout: Workout,
  progress?: WorkoutProgress,
): boolean {
  if (!progress) return false;
  if (progress.workoutCompleted) return true;

  if (!workout.exercises?.length || !progress.progressData?.length) {
    return false;
  }

  return workout.exercises.every(
    (exercise, index) =>
      (progress.progressData[index] ?? 0) >= exercise.quantity,
  );
}

export function getCompletedWorkoutIds(
  workouts: Workout[],
  progress?: CourseProgress | null,
): string[] {
  const byId = new Map(
    (progress?.workoutsProgress ?? []).map((item) => [
      String(item.workoutId),
      item,
    ]),
  );

  return workouts
    .filter((workout) => isWorkoutDone(workout, byId.get(String(workout._id))))
    .map((workout) => String(workout._id));
}

export function calcCourseProgressPercent(
  course: Pick<Course, 'workouts'>,
  progress?: CourseProgress | null,
): number {
  const total = course.workouts?.length ?? 0;
  if (!total) return 0;

  const completedIds = new Set(
    (progress?.workoutsProgress ?? [])
      .filter((item) => item.workoutCompleted)
      .map((item) => String(item.workoutId)),
  );

  // Считаем только тренировки этого курса из полного списка course.workouts
  const completed = course.workouts.filter((id) =>
    completedIds.has(String(id)),
  ).length;

  return Math.round((completed / total) * 100);
}
