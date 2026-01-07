import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import EntryPointTracker from "./routes/EntryPointTracker";
import LoadingSpinner from "./components/LoadingSpinner";
import PincodesData from "./AdminPages/PincodesData";
import StudentSalesData from "./Companies/Pages/StudentSalesData";

// Authentication Components
// (Legacy auth components imported elsewhere if needed)
// Authentication
const LoginTest = lazy(() => import("./AdminPages/AdminLogin"));
const AgentsLogin = lazy(() => import("./AgentsAdmin/Auth/AgentsLogin"));
const CompaniesLogin = lazy(() => import("./Companies/Auth/CompaniesLogin"));
const TaskManagementLogin = lazy(
  () => import("./TaskManagement/Authentication/TaskManagementLogin")
);

// Companies Admin
const CompanyList = lazy(() => import("./Companies/Pages/CompanyList"));
const JobsManagement = lazy(() => import("./Companies/Pages/JobsManage"));
const GetAllJobs = lazy(() => import("./Companies/Pages/GetAllJobs"));
const WeHiringPage = lazy(() => import("./Companies/Pages/WeHiringPage"));
// Agents Admin
const AgentsAdminLayout = lazy(
  () => import("./AgentsAdmin/Components/AgentsAdminLayout")
);
const AssistantsList = lazy(() => import("./AgentsAdmin/Pages/AssistantsList"));
const PlansList = lazy(() => import("./AgentsAdmin/Pages/PlansList"));
const AgentsList = lazy(() => import("./AgentsAdmin/Pages/AgentStatusList"));
const GeminiUsers = lazy(() => import("./AgentsAdmin/Pages/GeminiUsers"));
const ConversationsList = lazy(
  () => import("./AgentsAdmin/Pages/ConversationsList")
);
const AgentManagement = lazy(
  () => import("./AgentsAdmin/Pages/AgentManagement")
);
const AgentsRegisteredUsers = lazy(
  () => import("./AgentsAdmin/Pages/AgentsRegisteredUsers")
);
const AgentUserProfile = lazy(
  () => import("./AgentsAdmin/Pages/AgentUserProfile")
);
const GPTStore = lazy(() => import("./AgentsAdmin/Pages/GPTStore"));
const UserHistoryAdmin = lazy(
  () => import("./AgentsAdmin/Pages/UserHistoryAdmin")
);
const AgentsCreatrionUsers = lazy(
  () => import("./AgentsAdmin/Pages/AgentsCreationData")
);
const AgentsBmvCoinsUpdated = lazy(
  () => import("./AgentsAdmin/Pages/AgentsBmvCoinsUpdated")
);
const AgentStoreManager = lazy(
  () => import("./AgentsAdmin/Pages/AgentStoreManager")
);

// Task Management
const TaskCreation = lazy(() => import("./TaskManagement/Pages/TaskCreation"));
const TaskManagementByDate = lazy(
  () => import("./TaskManagement/Pages/TaskManagementByDate")
);
const AdminTasks = lazy(() => import("./TaskManagement/Pages/AdminTasks"));
const AdminInstructions = lazy(
  () => import("./TaskManagement/Pages/AdminInstructions")
);
const RadhaInstructionView = lazy(
  () => import("./TaskManagement/Pages/RadhaInstructionView")
);
const PlanOfTheDay = lazy(() => import("./TaskManagement/Pages/PlanOfTheDay"));
const EndOfTheDay = lazy(() => import("./TaskManagement/Pages/EndOfTheDay"));
const UserTaskDetailsPage = lazy(
  () => import("./TaskManagement/Pages/UserTaskDetailsPage")
);
const LeaveManagement = lazy(
  () => import("./TaskManagement/Pages/TodayLeaves ")
);
const TeamAttendanceReport = lazy(
  () => import("./TaskManagement/Pages/TeamAttendanceReport")
);
const EmployeeRegisteredUsers = lazy(
  () => import("./TaskManagement/Pages/EmployeeRegisteredUsers")
);
const Dashboard = lazy(() => import("./TaskManagement/Pages/Dashboard"));

// AdminPages (New Structure)
const AllQueries = lazy(() => import("./AdminPages/AllQueriesForAdmin"));
const Categories = lazy(() => import("./AdminPages/CategoryList"));
const Coupons = lazy(() => import("./AdminPages/CouponList"));
const Customers = lazy(() => import("./AdminPages/CustomerList"));
const CustomerUpdation = lazy(
  () => import("./AdminPages/CustomerUpdationDetails")
);
const DashboardTest = lazy(() => import("./AdminPages/Dashboard"));
const DeliveryBoys = lazy(() => import("./AdminPages/DeliveryBoyList"));
const ExchangeOrders = lazy(() => import("./AdminPages/ExchangeOrderList"));
const ItemList = lazy(() => import("./AdminPages/ItemsLists"));
const ItemsLists = lazy(() => import("./AdminPages/ItemRequiremnet"));
const Ordersdetails = lazy(() => import("./AdminPages/OrdersList"));
const OrdersDetailsCustomerId = lazy(
  () => import("./AdminPages/OrdersListbyCustomerId")
);
const OrdersPending = lazy(() => import("./AdminPages/PendingOrders"));
const NewsPapers = lazy(() => import("./Companies/Pages/NewsPapers"));
const SellerItems = lazy(() => import("./AdminPages/SellerItemsList"));
const Sellers = lazy(() => import("./AdminPages/SellersList"));
const Settings = lazy(() => import("./AdminPages/SettingsForm"));
const SubscriptionPlanListustomerId = lazy(
  () => import("./AdminPages/SubscriptionListByCustomerId")
);
const SubscriberDetailslist = lazy(
  () => import("./AdminPages/SubscriberDetails")
);
const Subscribers = lazy(() => import("./AdminPages/SubscribersList"));
const SubscriptionPlansList = lazy(
  () => import("./AdminPages/SubscriptionPlanList")
);
const AllInforMationOfBarCode = lazy(
  () => import("./AdminPages/AllInformationOfBarcode")
);
const CategoryInventory = lazy(() => import("./AdminPages/CategoryInventary"));
const TimeSlots = lazy(() => import("./AdminPages/TimeSlots"));
const AllReferralsData = lazy(() => import("./AdminPages/AllReferrelsData"));
const ActiveOffersList = lazy(() => import("./AdminPages/ActiveOffersList"));
const StudentApplications = lazy(
  () => import("./AdminPages/StudentApplications")
);
const Services = lazy(() => import("./AdminPages/ServicesList"));
const ServiceList = lazy(() => import("./AdminPages/ServiceList"));
const OrdersByCoupon = lazy(() => import("./AdminPages/OrdersByCoupon"));
const NBFCDataList = lazy(() => import("./AdminPages/NBFCDataList"));
const StudentRegistrations = lazy(
  () => import("./AdminPages/StudentRegistrations")
);
const InitiatedAmountList = lazy(
  () => import("./AdminPages/InitiatedAmountList")
);
const ApprovedAmountList = lazy(
  () => import("./AdminPages/ApprovedAmountList")
);
const WithdrawalRequests = lazy(
  () => import("./AdminPages/WithdrawalUsersList")
);
const FuelExpenses = lazy(() => import("./AdminPages/FuelExpenses"));
const BulkInviteCampaign = lazy(
  () => import("./AdminPages/BulkInviteCampaign")
);
const CampaignUpload = lazy(() => import("./AdminPages/CampaignUpload"));

// Legacy Components (Old Folder)
const DeliveryBoyList = lazy(() => import("./component/DeliveryBoyList"));
const SellersList = lazy(() => import("./component/SellersList"));
const SellerItemsList = lazy(() => import("./component/SellerItemsList"));
const ItemsList = lazy(() => import("./component/ItemsLists"));
const PendingOrders = lazy(() => import("./component/PendingOrders"));
const CouponList = lazy(() => import("./component/CouponList"));
const OrdersListDetailsCustomerId = lazy(
  () => import("./component/OrdersListbyCustomerId")
);
const RepliedList = lazy(() => import("./component/RepliedListOrders"));
const SlidesList = lazy(() => import("./component/SlidesList"));
const ItemRequirements = lazy(() => import("./component/ItemRequiremnet"));
const RefundOrders = lazy(() => import("./component/RefundOrders"));
const OrdersReport = lazy(() => import("./component/OrdersReport"));
const ChangePassword = lazy(() => import("./component/ChangePassword"));
const SettingsForm = lazy(() => import("./component/SettingsForm"));
const CategoryList = lazy(() => import("./component/CategoryList"));
const SubscriptionPlans = lazy(
  () => import("./component/SubscriptionPlanList")
);
const SubscribersList = lazy(() => import("./component/SubscribersList"));
const CustomerList = lazy(() => import("./component/CustomerList"));
const SellerAdd = lazy(() => import("./component/SellerAdd"));
const ExchangeOrderList = lazy(() => import("./component/ExchangeOrderList"));
const AllQueriesForAdmin = lazy(() => import("./component/AllQueriesForAdmin"));
const SubscriberDetails = lazy(() => import("./component/SubscriberDetails"));
const CustomerUpdationDetails = lazy(
  () => import("./component/CustomerUpdationDetails")
);
const SubscriptionPlanListDetailsCustomerId = lazy(
  () => import("./component/SubscriptionListByCustomerId")
);
// Route configuration arrays for cleaner structure
const companyAdminRoutes = [
  {
    path: "/admin/companylist",
    element: <CompanyList />,
    loginPath: "/admin/comapanieslogin",
  },
  {
    path: "/admin/studentsalesdata",
    element: <StudentSalesData />,
    loginPath: "/admin/comapanieslogin",
  },
  {
    path: "/admin/news-papers",
    element: <NewsPapers />,
    loginPath: "/admin/comapanieslogin",
  },
  {
    path: "/admin/jobsmanage",
    element: <JobsManagement />,
    loginPath: "/admin/comapanieslogin",
  },
  {
    path: "/admin/wearehiring",
    element: <WeHiringPage />,
    loginPath: "/admin/comapanieslogin",
  },
  {
    path: "/admin/getalljobs",
    element: <GetAllJobs />,
    loginPath: "/admin/comapanieslogin",
  },
];

const agentsAdminRoutes = [
  {
    path: "/admin/agentsdashboard",
    element: <AgentsAdminLayout />,
  },
  { path: "/admin/assistantslist", element: <AssistantsList /> },
  { path: "/admin/agents-aistore", element: <AgentStoreManager /> },
  { path: "/admin/conversationlist", element: <ConversationsList /> },
  { path: "/admin/agentsplanslist", element: <PlansList /> },
  { path: "/admin/agentsstatuslist", element: <AgentsList /> },
  { path: "/admin/agentsregisteredusers", element: <AgentsRegisteredUsers /> },
  { path: "/admin/agent-user", element: <AgentUserProfile /> },
  { path: "/admin/agents-creation-users", element: <AgentsCreatrionUsers /> },
  { path: "/admin/agent-gptstore", element: <GPTStore /> },
  { path: "/admin/userhistory", element: <UserHistoryAdmin /> },
  {
    path: "/admin/agents-bmv-coins-updated",
    element: <AgentsBmvCoinsUpdated />,
  },
  { path: "/admin/authorizedusers", element: <AgentManagement /> },
  { path: "/admin/agents-registered-users", element: <GeminiUsers /> },
].map((route) => ({
  loginPath: "/admin/agentslogin",
  ...route,
}));

const taskManagementRoutes = [
  {
    path: "/taskmanagement/taskcreation",
    element: <TaskCreation />,
  },
  {
    path: "/taskmanagementbydate",
    element: <TaskManagementByDate />,
  },
  {
    path: "/taskmanagement/tasklists",
    element: <AdminTasks />,
  },
  {
    path: "/taskmanagement/admininstructions",
    element: <AdminInstructions />,
  },
  {
    path: "/taskmanagement/chatview/:id",
    element: <RadhaInstructionView />,
  },
  {
    path: "/taskmanagement/planoftheday",
    element: <PlanOfTheDay />,
  },
  {
    path: "/taskmanagement/endoftheday",
    element: <EndOfTheDay />,
  },
  {
    path: "/user-task-details/:userId",
    element: <UserTaskDetailsPage />,
  },
  {
    path: "/taskmanagement/employeeleaves",
    element: <LeaveManagement />,
  },
  {
    path: "/taskmanagement/teamattendance",
    element: <TeamAttendanceReport />,
  },
  {
    path: "/taskmanagement/employee_registered_users",
    element: <EmployeeRegisteredUsers />,
  },
  {
    path: "/taskmanagement/dashboard",
    element: <Dashboard />,
  },
].map((route) => ({
  loginPath: "/admin/taskmanagementlogin",
  ...route,
}));

function App() {
  return (
    <Router>
      {/* useLocation now lives inside Router context */}
      <EntryPointTracker />
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
          {companyAdminRoutes.map(({ path, element, loginPath }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute element={element} loginPath={loginPath} />
              }
            />
          ))}
          {/* === AGENTS ADMIN - PROTECTED === */}
          {agentsAdminRoutes.map(({ path, element, loginPath }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute element={element} loginPath={loginPath} />
              }
            />
          ))}
          {/* Task Management */}
          {taskManagementRoutes.map(({ path, element, loginPath }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute element={element} loginPath={loginPath} />
              }
            />
          ))}
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
            element={
              <ProtectedRoute element={<OrdersListDetailsCustomerId />} />
            }
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
            path="/admin/pincodesdata"
            element={<ProtectedRoute element={<PincodesData />} />}
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
      </Suspense>
    </Router>
  );
}

export default App;
