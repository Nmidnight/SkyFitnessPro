import styles from './loading.module.css';

export default function Loading() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={`${styles.skeleton} ${styles.title}`} />
        <div className={`${styles.skeleton} ${styles.bubble}`} />
      </section>
      <section className={styles.courses}>
        <div className={styles.grid}>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className={`${styles.skeleton} ${styles.card}`} />
          ))}
        </div>
      </section>
    </main>
  );
}
