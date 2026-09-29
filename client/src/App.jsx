import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./routes/guards.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import { Spinner } from "./components/Feedback.jsx";
import { ROLES } from "./constants/roles.js";

const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const PurchasesPage = lazy(() => import("./pages/PurchasesPage.jsx"));
const TransfersPage = lazy(() => import("./pages/TransfersPage.jsx"));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage.jsx"));
const ExpendituresPage = lazy(() => import("./pages/ExpendituresPage.jsx"));
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage.jsx"));

export default function App() {
  return (
    <Suspense fallback={<Spinner label="Loading application" />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="transfers" element={<TransfersPage />} />
            <Route element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.BASE_COMMANDER]} />}>
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="expenditures" element={<ExpendituresPage />} />
            </Route>
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
