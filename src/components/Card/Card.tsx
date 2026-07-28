'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  addCourseToUser,
  removeCourseFromUser,
} from '@/services/coursesService';
import type { Course } from '@/types';
import styles from './Card.module.css';

const courseImages: Record<string, string> = {
  Yoga: '/images/yoga.png',
  Stretching: '/images/stretching.png',
  Fitness: '/images/fitness.png',
  StepAirobic: '/images/step-aerobics.png',
  BodyFlex: '/images/bodyflex.png',
};

type CardProps = {
  course: Course;
};

function formatDailyDuration(
  daily?: Course['dailyDurationInMinutes'],
): string {
  if (!daily) return '—';
  return `${daily.from}-${daily.to} мин/день`;
}

export default function Card({ course }: CardProps) {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const imageSrc = courseImages[course.nameEN] ?? '/images/yoga.png';
  const days = course.durationInDays ?? 0;
  const duration = formatDailyDuration(course.dailyDurationInMinutes);
  const isAdded = Boolean(user?.selectedCourses?.includes(course._id));
  const tooltip = isAdded ? 'Удалить курс' : 'Добавить курс';

  return (
    <Link href={`/course/${course._id}`} className={styles.card} prefetch={false}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageSrc}
          alt={course.nameRU}
          width={360}
          height={325}
          sizes="360px"
          quality={100}
          unoptimized
          className={styles.image}
        />
        <button
          type="button"
          className={styles.addButton}
          aria-label={tooltip}
          disabled={isPending}
          onClick={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!isAuthenticated) {
              window.dispatchEvent(new Event('open-auth'));
              return;
            }
            try {
              setIsPending(true);
              if (isAdded) {
                await removeCourseFromUser(course._id);
              } else {
                await addCourseToUser(course._id);
              }
              await refreshUser();
            } catch {
              // ignore for now
            } finally {
              setIsPending(false);
            }
          }}
        >
          <Image
            src={isAdded ? '/icons/delete.svg' : '/icons/add-circle.svg'}
            alt=""
            width={40}
            height={40}
            className={styles.plusIcon}
          />
          <span className={styles.tooltip}>{tooltip}</span>
        </button>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{course.nameRU}</h3>
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <div className={`${styles.detailItem} ${styles.days}`}>
              <Image
                src="/icons/calendar.svg"
                alt=""
                width={20}
                height={20}
                className={styles.icon}
              />
              <span>{days} дней</span>
            </div>
            <div className={`${styles.detailItem} ${styles.duration}`}>
              <Image
                src="/icons/time.svg"
                alt=""
                width={20}
                height={20}
                className={styles.icon}
              />
              <span>{duration}</span>
            </div>
          </div>
          <div className={`${styles.detailItem} ${styles.difficulty}`}>
            <Image
              src="/icons/difficulty.svg"
              alt=""
              width={20}
              height={20}
              className={styles.icon}
            />
            <span>Сложность</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
