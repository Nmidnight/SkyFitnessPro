'use client';

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

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h2 className={styles.title}>Выберите тренировку</h2>
        <ul className={styles.list}>
          {workouts.map((workout) => {
            const done = completedIds.includes(workout._id);
            return (
              <li key={workout._id}>
                <Link
                  href={`/workout/${workout._id}`}
                  className={`${styles.item} ${done ? styles.itemDone : ''}`}
                  onClick={onClose}
                >
                  <span className={styles.itemName}>{workout.name}</span>
                  {done ? <span className={styles.check}>✓</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
