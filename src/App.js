import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

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
import LoginOrRegister from "./Authentication/LoginOrRegister";
import Dashboard from "./component/Dashboard";
import SellerAdd from "./component/SellerAdd";
import ExchangeOrderList from "./component/ExchangeOrderList";
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";
import AllQueriesForAdmin from "./component/AllQueriesForAdmin";
import SubscriberDetails from "./component/SubscriberDetails";
import OrdersListDetailsCustomerId from "./component/OrdersListbyCustomerId";
import CustomerUpdationDetails from "./component/CustomerUpdationDetails";
import SubscriptionPlanListDetailsCustomerId from "./component/SubscriptionListByCustomerId";

//---------------------------------------------------Oxy Rice test Admin ---------------------------------------//
import AllQueries from "./ComponentTest/AllQueriesForAdmin";
import Categories from "./ComponentTest/CategoryList";
import Coupons from "./ComponentTest/CouponList";
import Customers from "./ComponentTest/CustomerList";
import CustomerUpdation from "./ComponentTest/CustomerUpdationDetails";
import DashboardTest from "./ComponentTest/Dashboard";
import DeliveryBoys from "./ComponentTest/DeliveryBoyList";
import ExchangeOrders from "./ComponentTest/ExchangeOrderList";
import ItemList from "./ComponentTest/ItemsLists";
import ItemsLists from "./ComponentTest/ItemRequiremnet";
import Ordersdetails from "./ComponentTest/OrdersList";
import OrdersDetailsCustomerId from "./ComponentTest/OrdersListbyCustomerId";
import OrdersPending from "./ComponentTest/PendingOrders";
import SellerItems from "./ComponentTest/SellerItemsList";
import Sellers from "./ComponentTest/SellersList";
import Settings from "./ComponentTest/SettingsForm";
import SubscriptionPlanListustomerId from "./ComponentTest/SubscriptionListByCustomerId";
import SubscriberDetailslist from "./ComponentTest/SubscriberDetails";
import Subscribers from "./ComponentTest/SubscribersList";
import SubscriptionPlansList from "./ComponentTest/SubscriptionPlanList";
import AllInforMationOfBarCode from "./ComponentTest/AllInformationOfBarcode";
import LoginTest from "./ComponentTest/LoginTest";
import CategoryInventory from "./ComponentTest/CategoryInventary";
import TimeSlots from "./ComponentTest/TimeSlots";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/SubscriberDetails" element={<SubscriberDetails />} />
        <Route path="user_queries" element={<AllQueriesForAdmin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/loginwithotp" element={<LoginOrRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/deliveryboy/deliveryboys_list"
          element={<DeliveryBoyList />}
        />
        <Route path="/seller/seller_list" element={<SellersList />} />
        <Route path="/selleradd" element={<SellerAdd />} />
        <Route path="/selleritems/:sellerId" element={<SellerItemsList />} />
        <Route path="/item/items_list" element={<ItemsList />} />
        <Route path="/exchange_orderslist" element={<ExchangeOrderList />} />
        <Route
          path="/subscription_plans/plans_list"
          element={<SubscriptionPlans />}
        />
        <Route
          path="/subscription_plans/user_subscriptions_list"
          element={<SubscribersList />}
        />
        <Route path="/coupons/coupons_list" element={<CouponList />} />
        <Route path="/orders/orders_list" element={<OrdersList />} />
        <Route
          path="/orders/orders_list/:id"
          element={<OrdersListDetailsCustomerId />}
        />
        <Route
          path="/subscription_plans/user_subscriptions_list/:id"
          element={<SubscriptionPlanListDetailsCustomerId />}
        />
        <Route path="/orders/return_pending_list" element={<PendingOrders />} />
        <Route path="/orders/return_replied_list" element={<RepliedList />} />
        <Route path="/slides/slides_list" element={<SlidesList />} />
        <Route
          path="/reports/item_requirements"
          element={<ItemRequirements />}
        />
        <Route path="/refunds" element={<RefundOrders />} />
        <Route path="/orders/report" element={<OrdersReport />} />
        <Route path="/customer/customers_list" element={<CustomerList />} />
        <Route path="/change_password" element={<ChangePassword />} />
        <Route path="/settings" element={<SettingsForm />} />
        <Route path="/category/category_list" element={<CategoryList />} />
        <Route
          path="/user/mobilenumber_updated"
          element={<CustomerUpdationDetails />}
        />
        {/* -----------------------------------Oxy Rice test Admin --------------------------------------- */}
        <Route path="/login" element={<LoginTest />} />
        <Route
          path="/admin/allinformationofbarcode/:itemId"
          element={<AllInforMationOfBarCode />}
        />
        <Route path="/admin" element={<DashboardTest />} />
        <Route path="/admin/timeslots" element={<TimeSlots/>}/>
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/coupons" element={<Coupons />} />
        <Route path="/admin/customers" element={<Customers />} />
        <Route path="/admin/customer-updation" element={<CustomerUpdation />} />
        <Route
          path="/admin/category-inventory"
          element={<CategoryInventory />}
        />
        <Route path="/admin/delivery-boys" element={<DeliveryBoys />} />
        <Route path="/admin/exchange-orders" element={<ExchangeOrders />} />
        <Route path="/admin/items" element={<ItemList />} />
        <Route path="/admin/items-lists" element={<ItemsLists />} />
        <Route path="/admin/orders-details" element={<Ordersdetails />} />
        <Route
          path="/admin/orders-details/:id"
          element={<OrdersDetailsCustomerId />}
        />
        <Route path="/admin/orders-pending" element={<OrdersPending />} />
        <Route
          path="/admin/sellers-items/:sellerId"
          element={<SellerItems />}
        />
        <Route path="/admin/sellers" element={<Sellers />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route
          path="/admin/subscription-plans-list"
          element={<SubscriptionPlansList />}
        />
        <Route
          path="/admin/subscription-plans-list/:id"
          element={<SubscriptionPlanListustomerId />}
        />
        <Route
          path="/admin/subscriber-details"
          element={<SubscriberDetailslist />}
        />
        <Route path="/admin/subscribers" element={<Subscribers />} />
        <Route path="/admin/user_queries" element={<AllQueries />} />
      </Routes>
    </Router>
  );
}

export default App;
