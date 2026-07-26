import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span className={styles.desktopTitle}>
            Начните заниматься спортом
            <br />
            и улучшите качество жизни
          </span>
          <span className={styles.mobileTitle}>
            <span>Начните заниматься</span>
            <span>спортом и улучшите</span>
            <span>качество жизни</span>
          </span>
        </h1>
        <div className={styles.bubble}>
          <Image
            src="/main.svg"
            alt="Измени своё тело за полгода!"
            width={288}
            height={120}
            className={styles.bubbleImage}
            priority
          />
        </div>
      </div>
    </section>
  );
}
