import { notFound } from 'next/navigation';
import CoursePageView from '@/components/CoursePage/CoursePage';
import { getCourseById } from '@/services/coursesService';
import type { Course } from '@/types';

type CourseRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseRoute({ params }: CourseRouteProps) {
  const { id } = await params;

  let course: Course | null = null;
  try {
    course = await getCourseById(id);
  } catch {
    course = null;
  }

  if (!course) {
    notFound();
  }

  return <CoursePageView course={course} />;
}
