'use client';

import styles from './ScrollTop.module.css';

export default function ScrollTop() {
  return (
    <button
      type="button"
      className={styles.button}
      aria-label="Прокрутить наверх"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      Наверх ↑
    </button>
  );
}
