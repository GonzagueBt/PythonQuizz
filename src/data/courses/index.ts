import type { CourseSection } from "@/types";
import { fundamentalsCourses } from "./fundamentals";
import { intermediateCourses } from "./intermediate";
import { advancedCourses } from "./advanced";
import { internalsCourses } from "./internals";
import { performanceCourses } from "./performance";
import { concurrencyCourses } from "./concurrency";
import { stdlibCourses } from "./stdlib";
import { numpyCourses } from "./numpy";
import { pandasCourses } from "./pandas";
import { sqlCourses } from "./sql";
import { professionalCourses } from "./professional";
import { gotchasCourses } from "./gotchas";

export const allCourses: CourseSection[] = [
  ...fundamentalsCourses,
  ...intermediateCourses,
  ...advancedCourses,
  ...internalsCourses,
  ...performanceCourses,
  ...concurrencyCourses,
  ...stdlibCourses,
  ...numpyCourses,
  ...pandasCourses,
  ...sqlCourses,
  ...professionalCourses,
  ...gotchasCourses,
];

export const courseById = new Map(allCourses.map((c) => [c.id, c]));
