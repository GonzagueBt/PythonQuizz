import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { CoursesPage } from "@/pages/CoursesPage";
import { CourseDetailPage } from "@/pages/CourseDetailPage";
import { ExercisesPage } from "@/pages/ExercisesPage";
import { PracticePage } from "@/pages/PracticePage";
import { ReviewPage } from "@/pages/ReviewPage";
import { ExamSetupPage } from "@/pages/ExamSetupPage";
import { ExamPage } from "@/pages/ExamPage";
import { ExamResultPage } from "@/pages/ExamResultPage";
import { ProgressPage } from "@/pages/ProgressPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cours" element={<CoursesPage />} />
        <Route path="/cours/:courseId" element={<CourseDetailPage />} />
        <Route path="/exercices" element={<ExercisesPage />} />
        <Route path="/pratique" element={<PracticePage />} />
        <Route path="/revision" element={<ReviewPage />} />
        <Route path="/examen" element={<ExamSetupPage />} />
        <Route path="/examen/session" element={<ExamPage />} />
        <Route path="/examen/resultat" element={<ExamResultPage />} />
        <Route path="/progression" element={<ProgressPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
