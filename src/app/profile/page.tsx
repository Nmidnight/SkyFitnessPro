'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import ChangeEmailModal from '@/components/ChangeEmailModal/ChangeEmailModal';
import ChangePasswordModal from '@/components/ChangePasswordModal/ChangePasswordModal';
import WorkoutSelectModal from '@/components/WorkoutSelectModal/WorkoutSelectModal';
import { useAuth } from '@/context/AuthContext';
import {
  getCourses,
  removeCourseFromUser,
  resetCourseProgress,
} from '@/services/coursesService';
import { changeEmail, changePassword } from '@/services/userService';
import {
  getCourseProgress,
  getCourseWorkouts,
} from '@/services/workoutsService';
import type { Course, CourseProgress, Workout } from '@/types';
import styles from './profile.module.css';

const courseImages: Record<string, string> = {
  Yoga: '/images/yoga.png',
  Stretching: '/images/stretching.png',
  Fitness: '/images/fitness.png',
  StepAirobic: '/images/step-aerobics.png',
  BodyFlex: '/images/bodyflex.png',
};

type ProfileCourseCard = {
  course: Course;
  progress: number;
  completedWorkoutIds: string[];
};

function calcProgress(progress?: CourseProgress): {
  percent: number;
  completedIds: string[];
} {
  const workouts = progress?.workoutsProgress ?? [];
  if (!workouts.length) {
    return { percent: 0, completedIds: [] };
  }
  const completedIds = workouts
    .filter((item) => item.workoutCompleted)
    .map((item) => item.workoutId);
  const percent = Math.round((completedIds.length / workouts.length) * 100);
  return { percent, completedIds };
}

function actionLabel(progress: number): string {
  if (progress >= 100) return 'Начать заново';
  if (progress > 0) return 'Продолжить';
  return 'Начать тренировки';
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<ProfileCourseCard[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/?auth=1');
    }
  }, [isAuthenticated, isLoading, router]);

  const loadCourses = useCallback(async () => {
    if (!user?.selectedCourses?.length) {
      setCards([]);
      setIsLoadingCourses(false);
      return;
    }

    try {
      setIsLoadingCourses(true);
      const all = await getCourses();
      const selected = user.selectedCourses
        .map((id) => all.find((course) => course._id === id))
        .filter((course): course is Course => Boolean(course));

      const withProgress = await Promise.all(
        selected.map(async (course) => {
          try {
            const progress = await getCourseProgress(course._id);
            const { percent, completedIds: done } = calcProgress(progress);
            return { course, progress: percent, completedWorkoutIds: done };
          } catch {
            return { course, progress: 0, completedWorkoutIds: [] };
          }
        }),
      );
      setCards(withProgress);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [user?.selectedCourses]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setTimeout(() => {
      void loadCourses();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, loadCourses]);

  const userName = user?.email ? user.email.split('@')[0] || '' : '';

  const openWorkouts = async (courseId: string, doneIds: string[]) => {
    try {
      const list = await getCourseWorkouts(courseId);
      setWorkouts(list);
      setCompletedIds(doneIds);
      setActiveCourseId(courseId);
    } catch {
      // ignore
    }
  };

  const handleRemove = async (courseId: string) => {
    try {
      await removeCourseFromUser(courseId);
      await refreshUser();
      await loadCourses();
    } catch {
      // ignore
    }
  };

  const handleAction = async (card: ProfileCourseCard) => {
    if (card.progress >= 100) {
      try {
        await resetCourseProgress(card.course._id);
        await loadCourses();
      } catch {
        // ignore
      }
      return;
    }
    await openWorkouts(card.course._id, card.completedWorkoutIds);
  };

  if (isLoading || !user) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Загрузка...</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Профиль</h1>

      <section className={styles.profileCard}>
        <div className={styles.avatar} aria-hidden>
          {userName.slice(0, 1).toUpperCase()}
        </div>
        <div className={styles.profileInfo}>
          <p className={styles.profileName}>{userName}</p>
          <p className={styles.profileLogin}>Логин: {user.email}</p>
          <div className={styles.profileActions}>
            <button
              className={styles.editButton}
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
            >
              Изменить логин
            </button>
            <button
              className={styles.editButton}
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Изменить пароль
            </button>
            <button
              className={styles.logoutButton}
              type="button"
              onClick={logout}
            >
              Выйти
            </button>
          </div>
        </div>
      </section>

      <section className={styles.coursesSection}>
        <h2 className={styles.sectionTitle}>Мои курсы</h2>
        {isLoadingCourses ? (
          <p className={styles.loading}>Загрузка курсов...</p>
        ) : cards.length === 0 ? (
          <p className={styles.empty}>У вас пока нет добавленных курсов</p>
        ) : (
          <div className={styles.coursesGrid}>
            {cards.map((card) => {
              const image =
                courseImages[card.course.nameEN] ?? '/images/yoga.png';
              const days = card.course.durationInDays ?? 0;
              const duration = card.course.dailyDurationInMinutes
                ? `${card.course.dailyDurationInMinutes.from}-${card.course.dailyDurationInMinutes.to} мин/день`
                : '—';

              return (
                <article key={card.course._id} className={styles.courseCard}>
                  <div className={styles.courseImageWrapper}>
                    <Image
                      src={image}
                      alt={card.course.nameRU}
                      width={360}
                      height={325}
                      className={styles.courseImage}
                    />
                    <button
                      className={styles.courseRemove}
                      type="button"
                      aria-label="Удалить курс"
                      data-tooltip="Удалить курс"
                      onClick={() => handleRemove(card.course._id)}
                    >
                      <Image
                        src="/icons/delete.svg"
                        alt=""
                        width={32}
                        height={32}
                      />
                    </button>
                  </div>
                  <div className={styles.courseContent}>
                    <h3 className={styles.courseTitle}>{card.course.nameRU}</h3>
                    <div className={styles.courseMeta}>
                      <span className={styles.metaItem}>
                        <Image
                          src="/icons/calendar.svg"
                          alt=""
                          width={20}
                          height={20}
                        />
                        {days} дней
                      </span>
                      <span className={styles.metaItem}>
                        <Image
                          src="/icons/time.svg"
                          alt=""
                          width={20}
                          height={20}
                        />
                        {duration}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <Image
                        src="/icons/difficulty.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                      Сложность
                    </div>
                    <div className={styles.progressRow}>
                      <span className={styles.progressLabel}>
                        Прогресс {card.progress}%
                      </span>
                      <div className={styles.progressBar}>
                        <span
                          className={styles.progressFill}
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                    </div>
                    <button
                      className={styles.courseAction}
                      type="button"
                      onClick={() => handleAction(card)}
                    >
                      {actionLabel(card.progress)}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <WorkoutSelectModal
        isOpen={Boolean(activeCourseId)}
        onClose={() => setActiveCourseId(null)}
        workouts={workouts}
        completedIds={completedIds}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={async ({ oldPassword, password }) => {
          await changePassword({
            email: user.email,
            oldPassword,
            password,
          });
        }}
      />

      <ChangeEmailModal
        isOpen={isEmailModalOpen}
        currentEmail={user.email}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={async ({ email, password }) => {
          await changeEmail({
            email: user.email,
            newEmail: email,
            password,
          });
          await refreshUser();
        }}
      />
    </main>
  );
}
