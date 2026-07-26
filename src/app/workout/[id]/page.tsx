'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCourses } from '@/services/coursesService';
import {
  getWorkoutById,
  getWorkoutProgress,
  saveWorkoutProgress,
} from '@/services/workoutsService';
import type { Course, Workout, WorkoutProgress } from '@/types';
import styles from './workout.module.css';

export default function WorkoutPage() {
  const params = useParams<{ id: string }>();
  const workoutId = params.id;
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<WorkoutProgress | null>(null);
  const [inputs, setInputs] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/?auth=1');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || !workoutId) return;

    let mounted = true;
    const load = async () => {
      try {
        setIsLoadingData(true);
        const [workoutData, allCourses] = await Promise.all([
          getWorkoutById(workoutId),
          getCourses(),
        ]);
        if (!mounted) return;

        setWorkout(workoutData);
        const currentCourse =
          allCourses.find((item) => item.workouts.includes(workoutId)) ?? null;
        setCourse(currentCourse);

        if (currentCourse) {
          try {
            const progressData = await getWorkoutProgress(
              currentCourse._id,
              workoutId,
            );
            if (mounted) {
              setProgress(progressData);
              setInputs(
                workoutData.exercises.map(
                  (_, index) => progressData.progressData?.[index] ?? 0,
                ),
              );
            }
          } catch {
            if (mounted) {
              setInputs(workoutData.exercises.map(() => 0));
            }
          }
        } else {
          setInputs(workoutData.exercises.map(() => 0));
        }
      } catch {
        logout();
        router.replace('/?auth=1');
      } finally {
        if (mounted) setIsLoadingData(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, logout, router, workoutId]);

  const exerciseProgress = useMemo(() => {
    if (!workout) return [];
    return workout.exercises.map((exercise, index) => {
      const done = progress?.progressData?.[index] ?? 0;
      const percent =
        exercise.quantity > 0
          ? Math.round((done / exercise.quantity) * 100)
          : 0;
      return {
        id: exercise._id,
        name: exercise.name,
        percent: Math.max(0, Math.min(100, percent)),
      };
    });
  }, [progress, workout]);

  const handleSave = useCallback(async () => {
    if (!course || !workout) return;

    const hasInvalid = workout.exercises.some((exercise, index) => {
      const value = inputs[index];
      return (
        value === undefined ||
        Number.isNaN(value) ||
        value < 0 ||
        value > exercise.quantity
      );
    });
    if (hasInvalid) {
      setProgressError('Введите корректные значения прогресса по упражнениям');
      return;
    }

    try {
      setProgressError(null);
      setIsSaving(true);
      await saveWorkoutProgress(course._id, workout._id, {
        progressData: inputs,
      });
      const updated = await getWorkoutProgress(course._id, workout._id);
      setProgress(updated);
      setIsModalOpen(false);
      setIsSuccessOpen(true);
    } catch (error) {
      setProgressError(
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить прогресс',
      );
    } finally {
      setIsSaving(false);
    }
  }, [course, inputs, workout]);

  if (isLoading || isLoadingData || !workout) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Загрузка тренировки...</p>
      </main>
    );
  }

  const videoSrc = workout.video.includes('embed')
    ? workout.video
    : workout.video.replace('watch?v=', 'embed/');

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{workout.name}</h1>

      <div className={styles.videoWrap}>
        <iframe
          className={styles.video}
          src={videoSrc}
          title={workout.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <section className={styles.exercises}>
        <h2 className={styles.sectionTitle}>Упражнения</h2>
        <ul className={styles.exerciseList}>
          {exerciseProgress.map((item) => (
            <li key={item.id} className={styles.exerciseItem}>
              <div className={styles.exerciseTop}>
                <span>{item.name}</span>
                <span>{item.percent}%</span>
              </div>
              <div className={styles.progressBar}>
                <span
                  className={styles.progressFill}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={() => {
            setProgressError(null);
            setIsModalOpen(true);
          }}
        >
          Заполнить свой прогресс
        </button>
      </section>

      {isModalOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>Мой прогресс</h3>
            <div className={styles.modalFields}>
              {workout.exercises.map((exercise, index) => (
                <label key={exercise._id} className={styles.field}>
                  <span>{exercise.name}</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    max={exercise.quantity}
                    value={inputs[index] ?? 0}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setProgressError(null);
                      setInputs((prev) =>
                        prev.map((item, i) =>
                          i === index
                            ? Math.max(0, Math.min(exercise.quantity, value))
                            : item,
                        ),
                      );
                    }}
                  />
                </label>
              ))}
            </div>
            {progressError ? (
              <p className={styles.errorMessage}>{progressError}</p>
            ) : null}
            <button
              className={styles.primaryButton}
              type="button"
              disabled={isSaving}
              onClick={handleSave}
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {isSuccessOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSuccessOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.successModal}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>Ваш прогресс сохранён!</h3>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => {
                setIsSuccessOpen(false);
                router.push('/profile');
              }}
            >
              Назад к профилю
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
