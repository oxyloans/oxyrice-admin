import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Authentication Components
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";
import LoginOrRegister from "./Authentication/LoginOrRegister";

// Dashboard and Other Components
import DeliveryBoyList from "./component/DeliveryBoyList";
import SellersList from "./component/SellersList";
import SellerItemsList from "./component/SellerItemsList";
import ItemsList from "./component/ItemsLists";
import PendingOrders from "./component/PendingOrders";
import CouponList from "./component/CouponList";
import OrdersList from "./component/OrdersList";
import RepliedList from "./component/RepliedListOrders";
import SlidesList from "./component/SlidesList";
import ItemRequirements from "./component/ItemRequiremnet";
import RefundOrders from "./component/RefundOrders";
import OrdersReport from "./component/OrdersReport";
import ChangePassword from "./component/ChangePassword";
import SettingsForm from "./component/SettingsForm";
import CategoryList from "./component/CategoryList";
import SubscriptionPlans from "./component/SubscriptionPlanList";
import SubscribersList from "./component/SubscribersList";
import CustomerList from "./component/CustomerList";
import SellerAdd from "./component/SellerAdd";
import ExchangeOrderList from "./component/ExchangeOrderList";
import AllQueriesForAdmin from "./component/AllQueriesForAdmin";
import SubscriberDetails from "./component/SubscriberDetails";
import OrdersListDetailsCustomerId from "./component/OrdersListbyCustomerId";
import CustomerUpdationDetails from "./component/CustomerUpdationDetails";
import SubscriptionPlanListDetailsCustomerId from "./component/SubscriptionListByCustomerId";

// Oxy Rice Test Admin Components (Updated Folder: AdminPages)
import AllQueries from "./AdminPages/AllQueriesForAdmin";
import Categories from "./AdminPages/CategoryList";
import Coupons from "./AdminPages/CouponList";
import Customers from "./AdminPages/CustomerList";
import CustomerUpdation from "./AdminPages/CustomerUpdationDetails";
import DashboardTest from "./AdminPages/Dashboard";
import DeliveryBoys from "./AdminPages/DeliveryBoyList";
import ExchangeOrders from "./AdminPages/ExchangeOrderList";
import ItemList from "./AdminPages/ItemsLists";
import ItemsLists from "./AdminPages/ItemRequiremnet";
import Ordersdetails from "./AdminPages/OrdersList";
import OrdersDetailsCustomerId from "./AdminPages/OrdersListbyCustomerId";
import OrdersPending from "./AdminPages/PendingOrders";
import SellerItems from "./AdminPages/SellerItemsList";
import Sellers from "./AdminPages/SellersList";
import Settings from "./AdminPages/SettingsForm";
import SubscriptionPlanListustomerId from "./AdminPages/SubscriptionListByCustomerId";
import SubscriberDetailslist from "./AdminPages/SubscriberDetails";
import Subscribers from "./AdminPages/SubscribersList";
import SubscriptionPlansList from "./AdminPages/SubscriptionPlanList";
import AllInforMationOfBarCode from "./AdminPages/AllInformationOfBarcode";
import LoginTest from "./AdminPages/AdminLogin";
import CategoryInventory from "./AdminPages/CategoryInventary";
import TimeSlots from "./AdminPages/TimeSlots";

import TaskManagementLogin from "./TaskManagement/Authentication/TaskManagementLogin";
import TaskCreation from "./TaskManagement/Pages/TaskCreation";
import TasksList from "./TaskManagement/Pages/TasksList";
import TaskAdminPanelLayout from "./TaskManagement/Layout/AdminPanel";
import PlanOfTheDay from "./TaskManagement/Pages/PlanOfTheDay";
import TaskManagementByDate from "./TaskManagement/Pages/TaskManagementByDate";
import Dashboard from "./TaskManagement/Pages/Dashboard";
import EmployeeRegisteredUsers from "./TaskManagement/Pages/EmployeeRegisteredUsers";
import EndOfTheDay from "./TaskManagement/Pages/EndOfTheDay";
// NOTE: make sure the import path has NO trailing space
import LeaveManagement from "./TaskManagement/Pages/TodayLeaves ";

import AllReferralsData from "./AdminPages/AllReferrelsData";
import ActiveOffersList from "./AdminPages/ActiveOffersList";
import StudentApplications from "./AdminPages/StudentApplications";
import Services from "./AdminPages/ServicesList";
import ServiceList from "./AdminPages/ServiceList";
import OrdersByCoupon from "./AdminPages/OrdersByCoupon";
import NBFCDataList from "./AdminPages/NBFCDataList";
import StudentRegistrations from "./AdminPages/StudentRegistrations";
import TeamAttendanceReport from "./TaskManagement/Pages/TeamAttendanceReport";
import UserTaskDetailsPage from "./TaskManagement/Pages/UserTaskDetailsPage";
import InitiatedAmountList from "./AdminPages/InitiatedAmountList";
import ApprovedAmountList from "./AdminPages/ApprovedAmountList";
import WithdrawalRequests from "./AdminPages/WithdrawalUsersList";

import AgentsLogin from "./AgentsAdmin/Auth/AgentsLogin";
import AgentsAdminLayout from "./AgentsAdmin/Components/AgentsAdminLayout";
import AssistantsList from "./AgentsAdmin/Pages/AssistantsList";
import PlansList from "./AgentsAdmin/Pages/PlansList";
import AgentsList from "./AgentsAdmin/Pages/AgentStatusList";
import GeminiUsers from "./AgentsAdmin/Pages/GeminiUsers";
import AdminInstructions from "./TaskManagement/Pages/AdminInstructions";
import RadhaInstructionView from "./TaskManagement/Pages/RadhaInstructionView";
import ConversationsList from "./AgentsAdmin/Pages/ConversationsList";
import AgentManagement from "./AgentsAdmin/Pages/AgentManagement";
import AgentsRegisteredUsers from "./AgentsAdmin/Pages/AgentsRegisteredUsers";
import AgentUserProfile from "./AgentsAdmin/Pages/AgentUserProfile";
import GPTStore from "./AgentsAdmin/Pages/GPTStore";
import UserHistoryAdmin from "./AgentsAdmin/Pages/UserHistoryAdmin";
import AdminTasks from "./TaskManagement/Pages/AdminTasks";
import CompaniesLogin from "./Companies/Auth/CompaniesLogin";
import CompanyList from "./Companies/Pages/CompanyList";
import JobsManagement from "./Companies/Pages/JobsManage";
import GetAllJobs from "./Companies/Pages/GetAllJobs";
import CampaignUpload from "./AdminPages/CampaignUpload";
import AgentsCreatrionUsers from "./AgentsAdmin/Pages/AgentsCreationData";
import FuelExpenses from "./AdminPages/FuelExpenses";
import AgentsBmvCoinsUpdated from "./AgentsAdmin/Pages/AgentsBmvCoinsUpdated";
import AgentStoreManager from "./AgentsAdmin/Pages/AgentStoreManager";
import BulkInviteCampaign from "./AdminPages/BulkInviteCampaign";

// ---- Protected Route (RRv6 style) ----
// const ProtectedRoute = ({ element }) => {
//   const isAuthenticated = !!localStorage.getItem("token");
//   return isAuthenticated ? element : <Navigate to="/" replace />;
// };

const ProtectedRoute = ({ element, loginPath = "/" }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const location = useLocation();

  if (!isAuthenticated) {
    // Save where user wanted to go
    localStorage.setItem(
      "redirectAfterLogin",
      location.pathname + location.search
    );
    return <Navigate to={loginPath} replace />;
  }
  return element;
};

// ---- Tracker rendered INSIDE Router ----
function EntryPointTracker() {
  const location = useLocation();

  useEffect(() => {
    const validEntryPoints = [
      "/",
      "/admin/agentslogin",
      "/admin/comapanieslogin",
      "/admin/taskmanagementlogin",
    ];
    if (validEntryPoints.includes(location.pathname)) {
      localStorage.setItem("entryPoint", location.pathname);
    }
  }, [location.pathname]);

  return null; // nothing to render
}

function App() {
  return (
    <Router>
      {/* useLocation now lives inside Router context */}
      <EntryPointTracker />

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
        <Route
          path="/admin/companylist"
          element={
            <ProtectedRoute
              element={<CompanyList />}
              loginPath="/admin/comapanieslogin"
            />
          }
        />
        <Route
          path="/admin/jobsmanage"
          element={
            <ProtectedRoute
              element={<JobsManagement />}
              loginPath="/admin/comapanieslogin"
            />
          }
        />
        <Route
          path="/admin/getalljobs"
          element={
            <ProtectedRoute
              element={<GetAllJobs />}
              loginPath="/admin/comapanieslogin"
            />
          }
        />
        {/* === AGENTS ADMIN - PROTECTED === */}
        <Route
          path="/admin/agentsdashboard"
          element={
            <ProtectedRoute
              element={<AgentsAdminLayout />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/assistantslist"
          element={
            <ProtectedRoute
              element={<AssistantsList />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/agents-aistore"
          element={
            <ProtectedRoute
              element={<AgentStoreManager />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/conversationlist"
          element={
            <ProtectedRoute
              element={<ConversationsList />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/agentsplanslist"
          element={
            <ProtectedRoute
              element={<PlansList />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/agentsstatuslist"
          element={
            <ProtectedRoute
              element={<AgentsList />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/agentsregisteredusers"
          element={
            <ProtectedRoute
              element={<AgentsRegisteredUsers />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/agent-user"
          element={
            <ProtectedRoute
              element={<AgentUserProfile />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/agents-creation-users"
          element={
            <ProtectedRoute
              element={<AgentsCreatrionUsers />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/agent-gptstore"
          element={
            <ProtectedRoute
              element={<GPTStore />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/userhistory"
          element={
            <ProtectedRoute
              element={<UserHistoryAdmin />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/agents-bmv-coins-updated"
          element={
            <ProtectedRoute
              element={<AgentsBmvCoinsUpdated />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/authorizedusers"
          element={
            <ProtectedRoute
              element={<AgentManagement />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        <Route
          path="/admin/agents-registered-users"
          element={
            <ProtectedRoute
              element={<GeminiUsers />}
              loginPath="/admin/agentslogin"
            />
          }
        />
        {/* Task Management */}

        <Route
          path="/taskmanagement/taskcreation"
          element={
            <ProtectedRoute
              element={<TaskCreation />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />

        <Route
          path="/taskmanagementbydate"
          element={
            <ProtectedRoute
              element={<TaskManagementByDate />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/taskmanagement/tasklists"
          element={
            <ProtectedRoute
              element={<AdminTasks />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/taskmanagement/admininstructions"
          element={
            <ProtectedRoute
              element={<AdminInstructions />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/taskmanagement/chatview/:id"
          element={
            <ProtectedRoute
              element={<RadhaInstructionView />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/taskmanagement/planoftheday"
          element={
            <ProtectedRoute
              element={<PlanOfTheDay />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/taskmanagement/endoftheday"
          element={
            <ProtectedRoute
              element={<EndOfTheDay />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/user-task-details/:userId"
          element={
            <ProtectedRoute
              element={<UserTaskDetailsPage />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/taskmanagement/employeeleaves"
          element={
            <ProtectedRoute
              element={<LeaveManagement />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/taskmanagement/teamattendance"
          element={
            <ProtectedRoute
              element={<TeamAttendanceReport />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/taskmanagement/employee_registered_users"
          element={
            <ProtectedRoute
              element={<EmployeeRegisteredUsers />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        <Route
          path="/taskmanagement/dashboard"
          element={
            <ProtectedRoute
              element={<Dashboard />}
              loginPath="/admin/taskmanagementlogin"
            />
          }
        />
        {/* Legacy/Other (protected) */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/SubscriberDetails"
          element={<ProtectedRoute element={<SubscriberDetails />} />}
        />
        <Route
          path="/user_queries"
          element={<ProtectedRoute element={<AllQueriesForAdmin />} />}
        />
        <Route
          path="/selleradd"
          element={<ProtectedRoute element={<SellerAdd />} />}
        />
        <Route
          path="/deliveryboy/deliveryboys_list"
          element={<ProtectedRoute element={<DeliveryBoyList />} />}
        />
        <Route
          path="/seller/seller_list"
          element={<ProtectedRoute element={<SellersList />} />}
        />
        <Route
          path="/selleritems/:sellerId"
          element={<ProtectedRoute element={<SellerItemsList />} />}
        />
        <Route
          path="/item/items_list"
          element={<ProtectedRoute element={<ItemsList />} />}
        />
        <Route
          path="/exchange_orderslist"
          element={<ProtectedRoute element={<ExchangeOrderList />} />}
        />
        <Route
          path="/subscription_plans/plans_list"
          element={<ProtectedRoute element={<SubscriptionPlans />} />}
        />
        <Route
          path="/subscription_plans/user_subscriptions_list"
          element={<ProtectedRoute element={<SubscribersList />} />}
        />
        <Route
          path="/coupons/coupons_list"
          element={<ProtectedRoute element={<CouponList />} />}
        />
        {/* <Route path="/orders/orders_list" element={<ProtectedRoute element={<OrdersList />} />} /> */}
        <Route
          path="/orders/orders_list/:id"
          element={<ProtectedRoute element={<OrdersListDetailsCustomerId />} />}
        />
        <Route
          path="/subscription_plans/user_subscriptions_list/:id"
          element={
            <ProtectedRoute
              element={<SubscriptionPlanListDetailsCustomerId />}
            />
          }
        />
        <Route
          path="/orders/return_pending_list"
          element={<ProtectedRoute element={<PendingOrders />} />}
        />
        <Route
          path="/orders/return_replied_list"
          element={<ProtectedRoute element={<RepliedList />} />}
        />
        <Route
          path="/slides/slides_list"
          element={<ProtectedRoute element={<SlidesList />} />}
        />
        <Route
          path="/reports/item_requirements"
          element={<ProtectedRoute element={<ItemRequirements />} />}
        />
        <Route
          path="/refunds"
          element={<ProtectedRoute element={<RefundOrders />} />}
        />
        <Route
          path="/orders/report"
          element={<ProtectedRoute element={<OrdersReport />} />}
        />
        <Route
          path="/customer/customers_list"
          element={<ProtectedRoute element={<CustomerList />} />}
        />
        <Route
          path="/change_password"
          element={<ProtectedRoute element={<ChangePassword />} />}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute element={<SettingsForm />} />}
        />
        <Route
          path="/category/category_list"
          element={<ProtectedRoute element={<CategoryList />} />}
        />
        <Route
          path="/user/mobilenumber_updated"
          element={<ProtectedRoute element={<CustomerUpdationDetails />} />}
        />
        <Route
          path="/admin/fuel-expenses"
          element={<ProtectedRoute element={<FuelExpenses />} />}
        />
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute element={<DashboardTest />} />}
        />
        <Route
          path="/admin/all-referrals"
          element={<ProtectedRoute element={<AllReferralsData />} />}
        />
        <Route
          path="/admin/nbfcdatalist"
          element={<ProtectedRoute element={<NBFCDataList />} />}
        />
        <Route
          path="/admin/timeslots"
          element={<ProtectedRoute element={<TimeSlots />} />}
        />
        <Route
          path="/admin/bulkinvites"
          element={<ProtectedRoute element={<BulkInviteCampaign />} />}
        />
        <Route
          path="/admin/categories"
          element={<ProtectedRoute element={<Categories />} />}
        />
        <Route
          path="/admin/initiatedamountlist"
          element={<ProtectedRoute element={<InitiatedAmountList />} />}
        />
        <Route
          path="/admin/approvedamountlist"
          element={<ProtectedRoute element={<ApprovedAmountList />} />}
        />
        <Route
          path="/admin/withdrawaluserlist"
          element={<ProtectedRoute element={<WithdrawalRequests />} />}
        />
        <Route
          path="/admin/coupons"
          element={<ProtectedRoute element={<Coupons />} />}
        />
        <Route
          path="/admin/ordersByCoupon"
          element={<ProtectedRoute element={<OrdersByCoupon />} />}
        />
        <Route
          path="/admin/studentapplications"
          element={<ProtectedRoute element={<StudentApplications />} />}
        />
        <Route
          path="/admin/student-registrations"
          element={<ProtectedRoute element={<StudentRegistrations />} />}
        />
        <Route
          path="/admin/customers"
          element={<ProtectedRoute element={<Customers />} />}
        />
        <Route
          path="/admin/customer-updation"
          element={<ProtectedRoute element={<CustomerUpdation />} />}
        />
        <Route
          path="/admin/services"
          element={<ProtectedRoute element={<Services />} />}
        />
        <Route
          path="/admin/serviceslist"
          element={<ProtectedRoute element={<ServiceList />} />}
        />
        <Route
          path="/admin/category-inventory"
          element={<ProtectedRoute element={<CategoryInventory />} />}
        />
        <Route
          path="/admin/campaign-inventory"
          element={<ProtectedRoute element={<CampaignUpload />} />}
        />
        <Route
          path="/admin/delivery-boys"
          element={<ProtectedRoute element={<DeliveryBoys />} />}
        />
        <Route
          path="/admin/exchange-orders"
          element={<ProtectedRoute element={<ExchangeOrders />} />}
        />
        <Route
          path="/admin/items"
          element={<ProtectedRoute element={<ItemList />} />}
        />
        <Route
          path="/admin/items-lists"
          element={<ProtectedRoute element={<ItemsLists />} />}
        />
        <Route
          path="/admin/items-offerlists"
          element={<ProtectedRoute element={<ActiveOffersList />} />}
        />
        <Route
          path="/admin/orders-details"
          element={<ProtectedRoute element={<Ordersdetails />} />}
        />
        <Route
          path="/admin/orders-details/:id"
          element={<ProtectedRoute element={<OrdersDetailsCustomerId />} />}
        />
        <Route
          path="/admin/orders-pending"
          element={<ProtectedRoute element={<OrdersPending />} />}
        />
        <Route
          path="/admin/sellers-items/:sellerId"
          element={<ProtectedRoute element={<SellerItems />} />}
        />
        <Route
          path="/admin/sellers"
          element={<ProtectedRoute element={<Sellers />} />}
        />
        <Route
          path="/admin/settings"
          element={<ProtectedRoute element={<Settings />} />}
        />
        <Route
          path="/admin/subscription-plans-list"
          element={<ProtectedRoute element={<SubscriptionPlansList />} />}
        />
        <Route
          path="/admin/subscription-plans-list/:id"
          element={
            <ProtectedRoute element={<SubscriptionPlanListustomerId />} />
          }
        />
        <Route
          path="/admin/subscriber-details"
          element={<ProtectedRoute element={<SubscriberDetailslist />} />}
        />
        <Route
          path="/admin/subscribers"
          element={<ProtectedRoute element={<Subscribers />} />}
        />
        <Route
          path="/admin/user_queries"
          element={<ProtectedRoute element={<AllQueries />} />}
        />
        <Route
          path="/admin/allinformationofbarcode/:itemId"
          element={<ProtectedRoute element={<AllInforMationOfBarCode />} />}
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
