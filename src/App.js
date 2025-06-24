import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// Authentication Components
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";
import LoginOrRegister from "./Authentication/LoginOrRegister";

// Dashboard and Other Components
// import Dashboard from "./component/Dashboard";
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
import TodayLeaves from "./TaskManagement/Pages/TodayLeaves ";
import AllReferralsData from "./AdminPages/AllReferrelsData";
import ActiveOffersList from "./AdminPages/ActiveOffersList";
import StudentApplications from "./AdminPages/StudentApplications";
// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("token") ? true : false; 
  return isAuthenticated ? element : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (No Authentication Required) */}
        {/* <Route path="/" element={<Login />} />
        <Route path="/login" element={<LoginTest />} />
        <Route path="/register" element={<Register />} />
        <Route path="/loginwithotp" element={<LoginOrRegister />} /> */}
        {/* Protected Routes (Authentication Required) */}
        <Route
          path="/admin/taskmanagementlogin"
          element={<TaskManagementLogin />}
        />
        <Route path="/taskmanagement/taskcreation" element={<TaskCreation />} />
        <Route
          path="/taskmanagementbydate"
          element={<TaskManagementByDate />}
        />
        <Route
          path="/taskmanagementlayout"
          element={<TaskAdminPanelLayout />}
        />
        <Route path="/taskmanagement/tasklists" element={<TasksList />} />
        <Route path="/taskmanagement/planoftheday" element={<PlanOfTheDay />} />
        <Route path="/taskmanagement/endoftheday" element={<EndOfTheDay />} />
        <Route
          path="/taskmanagement/employeeleaves"
          element={<TodayLeaves />}
        />
        <Route
          path="/taskmanagement/employee_registered_users"
          element={<EmployeeRegisteredUsers />}
        />
        <Route path="/taskmanagement/dashboard" element={<Dashboard />} />
        <Route path="/" element={<LoginTest />} />
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
        {/* <Route
          path="/orders/orders_list"
          element={<ProtectedRoute element={<OrdersList />} />}
        /> */}
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
          path="/admin/dashboard"
          element={<ProtectedRoute element={<DashboardTest />} />}
        />
        <Route
          path="/admin/all-referrals"
          element={<ProtectedRoute element={<AllReferralsData />} />}
        />
        <Route
          path="/admin/timeslots"
          element={<ProtectedRoute element={<TimeSlots />} />}
        />
        <Route
          path="/admin/categories"
          element={<ProtectedRoute element={<Categories />} />}
        />
        <Route
          path="/admin/coupons"
          element={<ProtectedRoute element={<Coupons />} />}
        />
        <Route
          path="/admin/studentapplications"
          element={<ProtectedRoute element={<StudentApplications />} />}
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
          path="/admin/category-inventory"
          element={<ProtectedRoute element={<CategoryInventory />} />}
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
        />{" "}
        {/* Catch all other routes and redirect to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
