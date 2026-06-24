import {
  ADMIN_BASE,
  TASK_BASE,
  STUDY_ABROAD_BASE,
  ADMIN_LOGIN,
  adminRoutes,
  companyAdminRoutes,
  agentsAdminRoutes,
  taskManagementRoutes,
  studyAbroadRoutes,
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

import Login from "./features/Superadmin/Auth/Login.jsx";
import Dashboard from "./features/Superadmin/Dashboard.jsx";
import EmployeeList from "./features/Superadmin/EmployeeList.jsx";
import ProtectedRoutes from "./features/Superadmin/ProtectedRoutes.jsx";
import SuperadminLayout from "./features/Superadmin/components/SuperadminLayout.jsx";
import AddCompany from "./features/Superadmin/components/AddCompany.jsx";
import AddBank from "./features/Superadmin/components/AddBank.jsx";
import AddEmployee from "./features/Superadmin/components/AddEmployee.jsx";
import AddPresentation from "./features/Superadmin/components/AddPresentation.jsx";
import AddDemo from "./features/Superadmin/components/AddDemo.jsx";
import CompanyList from "./features/Superadmin/components/CompanyList.jsx";
import BankList from "./features/Superadmin/components/BankList.jsx";
import CompanyEmployees from "./features/Superadmin/CompanyEmployees.jsx";
import BankEmployees from "./features/Superadmin/BankEmployees.jsx";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const LoadingSpinner = lazy(() => import("./shared/components/LoadingSpinner"));
const ProtectedRoute = lazy(() => import("./core/routing/ProtectedRoute"));
const EntryPointTracker = lazy(
  () => import("./core/routing/EntryPointTracker"),
);

const Email = lazy(() => import("./features/admin/pages/Emailcampaign"));
const AdminLoginPage = lazy(() => import("./core/auth/AdminLogin"));
const AgentLoginPage = lazy(
  () => import("./features/agents/pages/AgentsLogin"),
);
const CompaniesLoginPage = lazy(() => import("./core/auth/CompaniesLogin"));
const TaskManagementLoginPage = lazy(
  () => import("./features/tasks/pages/TaskManagementLogin"),
);
const StudyAbroadLoginPage = lazy(
  () => import("./features/study-abroad/pages/StudyAbroadLogin"),
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
            <Route path="/superadmin/login" element={<Login />} />
            <Route
              path="/superadmin/dashboard"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <Dashboard />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/employees"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <EmployeeList />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/companies"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <CompanyList />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/banks"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <BankList />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/companies/:companyId/employees"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <CompanyEmployees />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/banks/:bankId/employees"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <BankEmployees />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/add-company"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <AddCompany />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/add-bank"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <AddBank />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/add-employee"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <AddEmployee />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/add-presentation"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <AddPresentation />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/superadmin/add-demo"
              element={
                <ProtectedRoutes
                  element={
                    <SuperadminLayout>
                      <AddDemo />
                    </SuperadminLayout>
                  }
                  loginPath={"/superadmin/login"}
                />
              }
            />
            <Route
              path="/admin/companieslogin"
              element={<CompaniesLoginPage />}
            />
            <Route
              path="/admin/taskmanagementlogin"
              element={<TaskManagementLoginPage />}
            />
            <Route
              path="/admin/studyabroadlogin"
              element={<StudyAbroadLoginPage />}
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
            {/* === STUDY ABROAD - PROTECTED === */}
            {studyAbroadRoutes.map(({ path, element, loginPath }) => {
              const Comp = element;
              return (
                <Route
                  key={`${STUDY_ABROAD_BASE}/${path}`}
                  path={`${STUDY_ABROAD_BASE}/${path}`}
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
