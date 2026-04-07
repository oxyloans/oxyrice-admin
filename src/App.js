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

const LoadingSpinner = lazy(() => import("./shared/components/LoadingSpinner"));
const ProtectedRoute = lazy(() => import("./core/routing/ProtectedRoute"));
const EntryPointTracker = lazy(() => import("./core/routing/EntryPointTracker"));

const Email = lazy(() => import("./features/admin/pages/Emailcampaign"));
const AdminLoginPage = lazy(() => import("./core/auth/AdminLogin"));
const AgentLoginPage = lazy(() => import("./core/auth/AgentsLogin"));
const CompaniesLoginPage = lazy(() => import("./core/auth/CompaniesLogin"));
const TaskManagementLoginPage = lazy(
  () => import("./features/tasks/pages/TaskManagementLogin"),
);

function App() {
  return (
    <Router>
      <MantineProvider defaultColorScheme="light">
        <Notifications position="top-right" />
        <Suspense fallback={<LoadingSpinner />}>
          <EntryPointTracker />
          <Routes>
            {/* Public */}
            <Route path="/" element={<AdminLoginPage />} />
            <Route path="/admin/agentslogin" element={<AgentLoginPage />} />
            <Route
              path="/admin/companieslogin"
              element={<CompaniesLoginPage />}
            />
            <Route
              path="/admin/taskmanagementlogin"
              element={<TaskManagementLoginPage />}
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




