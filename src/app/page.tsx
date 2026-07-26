import Card from '@/components/Card/Card';
import Hero from '@/components/Hero/Hero';
import ScrollTop from '@/components/ScrollTop/ScrollTop';
import { getCourses } from '@/services/coursesService';
import type { Course } from '@/types';
import styles from './page.module.css';

const courseOrder = [
  'Yoga',
  'Stretching',
  'Fitness',
  'StepAirobic',
  'BodyFlex',
];

function sortCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    const ai = courseOrder.indexOf(a.nameEN);
    const bi = courseOrder.indexOf(b.nameEN);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export default async function Home() {
  const courses = sortCourses(await getCourses());

  return (
    <main>
      <Hero />
      <section className={styles.courses}>
        <div className={styles.grid}>
          {courses.map((course) => (
            <Card key={course._id} course={course} />
          ))}
        </div>
        <ScrollTop />
      </section>
    </main>
  );
}
