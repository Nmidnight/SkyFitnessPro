import {
  calcCourseProgressPercent,
  getCompletedWorkoutIds,
} from '@/utils/courseProgress';
import type { Course, CourseProgress, Workout } from '@/types';

describe('courseProgress', () => {
  const course = {
    workouts: ['w1', 'w2', 'w3', 'w4', 'w5'],
  } as Pick<Course, 'workouts'>;

  const workouts: Workout[] = [
    { _id: 'w1', name: 'One', video: '', exercises: [{ _id: 'e1', name: 'A', quantity: 10 }] },
    { _id: 'w2', name: 'Two', video: '', exercises: [{ _id: 'e2', name: 'B', quantity: 10 }] },
  ];

  it('calculates percent from total course workouts, not progress length', () => {
    const progress: CourseProgress = {
      courseId: 'c1',
      courseCompleted: false,
      workoutsProgress: [
        { workoutId: 'w1', workoutCompleted: true, progressData: [10] },
      ],
    };

    expect(calcCourseProgressPercent(course, progress)).toBe(20);
  });

  it('returns 0 when there is no progress', () => {
    expect(calcCourseProgressPercent(course, null)).toBe(0);
  });

  it('marks completed workouts by workoutCompleted flag', () => {
    const progress: CourseProgress = {
      courseId: 'c1',
      courseCompleted: false,
      workoutsProgress: [
        { workoutId: 'w1', workoutCompleted: true, progressData: [10] },
        { workoutId: 'w2', workoutCompleted: false, progressData: [2] },
      ],
    };

    expect(getCompletedWorkoutIds(workouts, progress)).toEqual(['w1']);
  });

  it('marks workout complete when all exercise quantities are reached', () => {
    const progress: CourseProgress = {
      courseId: 'c1',
      courseCompleted: false,
      workoutsProgress: [
        { workoutId: 'w2', workoutCompleted: false, progressData: [10] },
      ],
    };

    expect(getCompletedWorkoutIds(workouts, progress)).toEqual(['w2']);
  });

  it('ignores completed workouts that are not in the course list', () => {
    const progress: CourseProgress = {
      courseId: 'c1',
      courseCompleted: false,
      workoutsProgress: [
        { workoutId: 'w1', workoutCompleted: true, progressData: [10] },
        { workoutId: 'other', workoutCompleted: true, progressData: [10] },
      ],
    };

    expect(calcCourseProgressPercent(course, progress)).toBe(20);
  });
});
