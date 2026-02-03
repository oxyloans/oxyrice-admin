import {
  ADMIN_BASE,
  TASK_BASE,
  ADMIN_LOGIN,
  adminRoutes,
  companyAdminRoutes,
  agentsAdminRoutes,
  taskManagementRoutes,
} from "./core/routing/routesConfig";

import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import ProtectedRoute from "./core/routing/ProtectedRoute";
import EntryPointTracker from "./core/routing/EntryPointTracker";
import LoadingSpinner from "./shared/components/LoadingSpinner";

import Email from "./features/admin/pages/Emailcampaign";

const LoginTest = lazy(() => import("./core/auth/AdminLogin"));
const AgentsLogin = lazy(() => import("./core/auth/AgentsLogin"));
const CompaniesLogin = lazy(() => import("./core/auth/CompaniesLogin"));
const TaskManagementLogin = lazy(
  () => import("./features/tasks/pages/TaskManagementLogin"),
);

function App() {
  return (
    <Router>
      {/* useLocation now lives inside Router context */}
      <EntryPointTracker />
      <MantineProvider defaultColorScheme="light">
        <Notifications position="top-right" />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LoginTest />} />
            <Route path="/admin/agentslogin" element={<AgentsLogin />} />
            <Route path="/admin/comapanieslogin" element={<CompaniesLogin />} />
            <Route
              path="/admin/taskmanagementlogin"
              element={<TaskManagementLogin />}
            />
            {/* === COMPANIES ADMIN - PROTECTED === */}
            {companyAdminRoutes.map(({ path, element, loginPath }) => {
              const Comp = element;
              return (
                <Route
                  key={`${ADMIN_BASE}/${path}`}
                  path={`${ADMIN_BASE}/${path}`}
                  element={
                    <ProtectedRoute
                      element={Comp ? <Comp /> : null}
                      loginPath={loginPath}
                    />
                  }
                />
              );
            })}
            {/* === TASK MANAGEMENT - PROTECTED === */}
            {taskManagementRoutes.map(({ path, element, loginPath }) => {
              const Comp = element;
              return (
                <Route
                  key={`${TASK_BASE}/${path}`}
                  path={`${TASK_BASE}/${path}`}
                  element={
                    <ProtectedRoute
                      element={Comp ? <Comp /> : null}
                      loginPath={loginPath}
                    />
                  }
                />
              );
            })}
            {/* === AGENTS ADMIN - PROTECTED === */}
            {agentsAdminRoutes.map(({ path, element, loginPath }) => {
              const Comp = element;
              return (
                <Route
                  key={`${ADMIN_BASE}/${path}`}
                  path={`${ADMIN_BASE}/${path}`}
                  element={
                    <ProtectedRoute
                      element={Comp ? <Comp /> : null}
                      loginPath={loginPath}
                    />
                  }
                />
              );
            })}
            {/*  Ask Oxy AdminPages  */}
            {adminRoutes.map(({ path, element }) => {
              const Comp = element;
              return (
                <Route
                  key={`${ADMIN_BASE}/${path}`}
                  path={`${ADMIN_BASE}/${path}`}
                  element={
                    <ProtectedRoute
                      element={Comp ? <Comp /> : null}
                      loginPath={ADMIN_LOGIN}
                    />
                  }
                />
              );
            })}
            <Route path="/emailcampaignexcel" element={<Email />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MantineProvider>
    </Router>
  );
}

export default App;
