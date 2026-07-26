'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  addCourseToUser,
  removeCourseFromUser,
} from '@/services/coursesService';
import type { Course } from '@/types';
import styles from './CoursePage.module.css';

const courseHeroImages: Record<string, string> = {
  Yoga: '/images/course/yoga-hero.png',
  Stretching: '/images/course/stretching-hero.png',
  Fitness: '/images/course/fitness-hero.png',
  StepAirobic: '/images/course/step-aerobics-hero.png',
  BodyFlex: '/images/course/bodyflex-hero.png',
};

type CoursePageProps = {
  course: Course;
};

function benefitsFromDescription(description: string): string[] {
  return description
    .split(/[.!?]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 20)
    .slice(0, 5);
}

export default function CoursePageView({ course }: CoursePageProps) {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const isInProfile = Boolean(user?.selectedCourses?.includes(course._id));
  const heroSrc =
    courseHeroImages[course.nameEN] ?? '/images/course/yoga-hero.png';
  const suitability = course.fitting.slice(0, 3);
  const directions = course.directions;
  const benefits =
    benefitsFromDescription(course.description).length > 0
      ? benefitsFromDescription(course.description)
      : course.fitting;

  const handleAction = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new Event('open-auth'));
      return;
    }

    try {
      setIsPending(true);
      if (isInProfile) {
        await removeCourseFromUser(course._id);
      } else {
        await addCourseToUser(course._id);
      }
      await refreshUser();
    } catch {
      // ignore
    } finally {
      setIsPending(false);
    }
  };

  const buttonLabel = !isAuthenticated
    ? 'Войдите, чтобы добавить курс'
    : isInProfile
      ? 'Удалить курс'
      : 'Добавить курс';

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image
          src={heroSrc}
          alt=""
          fill
          sizes="(max-width: 1200px) 100vw, 1160px"
          quality={100}
          unoptimized
          className={styles.heroImage}
          priority
        />
        <h1 className={styles.srOnly}>{course.nameRU}</h1>
      </section>

      {suitability.length > 0 && (
        <section className={styles.suitability}>
          <h2 className={styles.sectionTitle}>Подойдет для вас, если:</h2>
          <div className={styles.suitabilityCards}>
            {suitability.map((item, index) => (
              <div className={styles.suitabilityCard} key={item}>
                <span className={styles.suitabilityNumber}>{index + 1}</span>
                <p className={styles.suitabilityText}>{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {directions.length > 0 && (
        <section className={styles.directions}>
          <h2 className={styles.sectionTitle}>Направления</h2>
          <div className={styles.directionsList}>
            {directions.map((direction) => (
              <div className={styles.directionItem} key={direction}>
                <Image
                  src="/icons/sparkle.svg"
                  alt=""
                  width={26}
                  height={26}
                  className={styles.directionIcon}
                />
                <span>{direction}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.promo}>
        <div className={styles.promoContent}>
          <h2 className={styles.promoTitle}>
            Начните путь
            <br />к новому телу
          </h2>
          <ul className={styles.promoList}>
            {benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
          <button
            className={styles.promoButton}
            type="button"
            disabled={isPending}
            onClick={handleAction}
          >
            {buttonLabel}
          </button>
        </div>
        <div className={styles.promoDecor} aria-hidden>
          <Image
            src="/images/course/course-swoosh.png"
            alt=""
            width={520}
            height={370}
            quality={100}
            unoptimized
            className={styles.promoSwoosh}
          />
          <Image
            src="/images/course/course-man.png"
            alt=""
            width={360}
            height={400}
            quality={100}
            unoptimized
            className={styles.promoMan}
          />
        </div>
      </section>
    </main>
  );
}
