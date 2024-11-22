import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import DeliveryBoyList from './component/DeliveryBoyList';
import SellersList from './component/SellersList';
import SellerItemsList from './component/SellerItemsList';
import ItemsList from './component/ItemsLists';
import PendingOrders from './component/PendingOrders';
import CouponList from './component/CouponList';
import OrdersList from './component/OrdersList';
import RepliedList from './component/RepliedListOrders';
import SlidesList from './component/SlidesList';
import ItemRequirements from './component/ItemRequiremnet';
import RefundOrders from './component/RefundOrders';
import OrdersReport from './component/OrdersReport';
import ChangePassword from './component/ChangePassword';
import SettingsForm from './component/SettingsForm';
import CategoryList from './component/CategoryList';
import SubscriptionPlanList from './component/SubscriptionPlanList';
import SubscriberDetails from './component/SubscriberDetails';
import CustomerList from './component/CustomerList';
import LoginOrRegister from './Authentication/LoginOrRegister';
import Dashboard from './component/Dashboard';
import SellerAdd from './component/SellerAdd';
import LoginOrRegister1 from './Authentication/RegisterorLogin';
import Login from './Authentication/Login';
import Register from './Authentication/Register';
import MainLayout from './component/Layout';

function App() {
  return (
    <Router>
 
        {/* Define Routes */}
        <Routes>
            {/* Redirect from the root URL to the desired default path */}
            {/* <Route path="/" element={<LoginOrRegister1/>} /> */}
            <Route path="/" element={<Login />} />
           <Route path="/register" element={<Register />} /> 
            <Route path='/loginwithotp' element={<LoginOrRegister/>}/>
            <Route path='/dashboard' element={<Dashboard/>}/>
            <Route path="/deliveryboys" element={<DeliveryBoyList />} />
            <Route path="/sellerslist" element={<SellersList />} />
            <Route path="/selleradd" element={<SellerAdd />} />
            <Route path="/selleritems/:sellerId" Component={SellerItemsList} />
            <Route path="/items" element={<ItemsList />} />
            
            <Route path="/subscriptionplans" element={<SubscriptionPlanList />} />
            <Route path="/subscribers" element={<SubscriberDetails />} />
            <Route path="/coupons" element={<CouponList />} />
            <Route path="/orderslist" element={<OrdersList />} />
            <Route path="/pendingorders" element={<PendingOrders />} />
            <Route path="/repliedorders" element={<RepliedList />} />
            <Route path="/slides" element={<SlidesList />} />
            <Route path="/itemrequirements" element={<ItemRequirements />} />
            <Route path="/refunds" element={<RefundOrders />} />
            <Route path="/orders/report" element={<OrdersReport />} />
            <Route path="/customerslist" element={<CustomerList />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/settings" element={<SettingsForm />} />
            <Route path="/categories" element={<CategoryList />} />
          </Routes>
    </Router>
  );
}

export default App;
