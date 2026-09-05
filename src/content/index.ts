import { englishCourse } from './en'
import { chineseCourse } from './zh'
import type { Course, Item, Lang, Lesson, Unit } from './types'

export * from './types'

export const courses: Record<Lang, Course> = {
  en: englishCourse,
  zh: chineseCourse
}

export const courseList: Course[] = [englishCourse, chineseCourse]

export function getCourse(id: string): Course | undefined {
  return courses[id as Lang]
}

export interface FlatLesson {
  unit: Unit
  lesson: Lesson
  index: number
}

export function flatLessons(course: Course): FlatLesson[] {
  const out: FlatLesson[] = []
  let index = 0
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      out.push({ unit, lesson, index })
      index++
    }
  }
  return out
}

export function findLesson(
  courseId: string,
  unitId: string,
  lessonId: string
): { course: Course; unit: Unit; lesson: Lesson } | undefined {
  const course = getCourse(courseId)
  if (!course) return undefined
  const unit = course.units.find((u) => u.id === unitId)
  if (!unit) return undefined
  const lesson = unit.lessons.find((l) => l.id === lessonId)
  if (!lesson) return undefined
  return { course, unit, lesson }
}

const itemIndex = new Map<string, Item & { courseId: Lang }>()

for (const course of courseList) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      for (const item of lesson.items) {
        if (!itemIndex.has(item.id)) {
          itemIndex.set(item.id, { ...item, courseId: course.id })
        }
      }
    }
  }
}

export function getItem(id: string): (Item & { courseId: Lang }) | undefined {
  return itemIndex.get(id)
}
