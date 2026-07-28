'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import type { Workout } from '@/types';
import styles from './WorkoutSelectModal.module.css';

type WorkoutSelectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workouts: Workout[];
  completedIds?: string[];
};

export default function WorkoutSelectModal({
  isOpen,
  onClose,
  workouts,
  completedIds = [],
}: WorkoutSelectModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('noScroll');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('noScroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const completed = new Set(completedIds.map(String));

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className={styles.title}>Выберите тренировку</h2>
        <ul className={styles.list}>
          {workouts.map((workout, index) => {
            const done = completed.has(String(workout._id));
            return (
              <li key={workout._id}>
                <Link
                  href={`/workout/${workout._id}`}
                  className={styles.item}
                  onClick={onClose}
                >
                  <span className={styles.itemIcon} aria-hidden>
                    <Image
                      src={
                        done
                          ? '/icons/check-circle.png'
                          : '/icons/check-circle-empty.png'
                      }
                      alt=""
                      width={24}
                      height={24}
                    />
                  </span>
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>{workout.name}</span>
                    <span className={styles.itemSubtitle}>
                      Урок {index + 1}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
