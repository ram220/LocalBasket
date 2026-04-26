import {React, useEffect, useState} from 'react';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './pages/userPages/Home';
import Login from './pages/userPages/Login';
import UserRegister from './pages/userPages/UserRegister';
import VendorRegister from './pages/vendorPages/VendorRegister';
import Products from './pages/userPages/Products';
import AllProducts from './pages/userPages/AllProducts';
import VendorLayout from './layouts/VendorLayout';
import AddProduct from './pages/vendorPages/AddProduct';
import ViewProducts from './pages/vendorPages/ViewProducts';
import ProductDetails from './pages/userPages/ProductDetails';
import UserLayout from './layouts/UserLayout';
import Cart from './pages/userPages/Cart';
import axios from 'axios';
import OrderSummary from './pages/userPages/OrderSummary';
import ViewOrders from './pages/vendorPages/ViewOrders';
import TotalIncome from './pages/vendorPages/TotalIncome';
import MyOrders from './pages/userPages/MyOrders';
import UpdateDetails from './pages/userPages/UpdateDetails'
import {jwtDecode} from 'jwt-decode';
import SearchedPage from './pages/userPages/SearchedPage';
import OffersPage from './pages/userPages/OffersPage';
import Chatbot from './pages/userPages/Chatbot';
import VendorsManagement from './pages/adminPages/VendorsManagement';
import AdminLayout from './layouts/AdminLayouts';
import AdminOrders from './pages/adminPages/AdminOrders';
import AddDeliveryAgent from './pages/adminPages/AddDeliveryAgent';
import ManageAgents from './pages/adminPages/ManageAgents';
import DeliveryAgentLayout from './layouts/DeliveryAgentLayout';
import AgentOrders from './pages/deliveryPartnerPages/AgentOrders';
import RegisterDeliveryAgent from './pages/deliveryPartnerPages/AgentRegister';
import ForgotPassword from './pages/userPages/ForgotPassword';
import './App.css'
import ResetPassword from './pages/userPages/ResetPassword';
import AgentDashboard from './pages/deliveryPartnerPages/AgentDashboard';
import API_URL from './config';

function App() {

const [isLoggedIn, setIsLoggedIn] = useState(() => {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
});
  const [cart,setCart] = useState([]);

  const fetchCart = async()=>{
    const token=localStorage.getItem("token");
    if(!token){
      return;
    }
    try{
      const res=await axios.get(`${API_URL}/api/cart/getCart`,{
        headers:{Authorization:`Bearer ${token}`}
      })

      setCart(res.data.cart.items);
    }
    catch(err){
      const message=err.response?.data.message || "something went wrong while fetching your cart";
      alert(message);
    }
  };

 useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    logoutUser();
    return;
  }

  try {
    const decoded = jwtDecode(token);

    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();

    if (expiryTime < currentTime) {
      logoutUser();
    } else {
      const remainingTime = expiryTime - currentTime;

      const timeout = setTimeout(() => {
        logoutUser();
      }, remainingTime);

      return () => clearTimeout(timeout);
    }
  } catch {
    logoutUser();
  }
}, []);
const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  setIsLoggedIn(false);
  setCart([]);
};

  return (
   <BrowserRouter>
      <Routes>

        {/* user routes */}
        <Route path='/' element={<UserLayout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setCart={setCart} logoutUser={logoutUser} cart={cart} fetchCart={fetchCart}/>}>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} fetchCart={fetchCart}/>}/>
          <Route path="/register-user" element={<UserRegister/>}/>
          <Route path="/register-vendor" element={<VendorRegister/>}/>
          <Route path="/register-agent" element={<RegisterDeliveryAgent/>}/>
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route path="/reset-password/:token/:role" element={<ResetPassword/>}/>
          <Route path="/store/:id" element={<Products/>}/>
          <Route path="/products" element={<AllProducts/>}/>
          <Route path="/product_details/:productId" element={<ProductDetails/>}/>
          <Route path="/searched_product" element={<SearchedPage/>}/>
          <Route path="/my_orders" element={<MyOrders/>}/>
          <Route path="/offers" element={<OffersPage/>}/>
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} fetchCart={fetchCart}/>}/>
          <Route path="/ordery_summary" element={<OrderSummary cart={cart} setCart={setCart}/>}/>
          <Route path="/update_details" element={<UpdateDetails/>}/>
          <Route path='/chatbot' element={<Chatbot/>}/>
        </Route>


        {/* vendor routes */}
        <Route path='/vendor/*' element={isLoggedIn && localStorage.getItem("role") === "vendor" ? <VendorLayout logoutUser={logoutUser}/> : <Login setIsLoggedIn={setIsLoggedIn}/>}>
          <Route path='add_product' element={<AddProduct/>}/>
          <Route path='view_products' element={<ViewProducts/>}/>
          <Route path="view_orders" element={<ViewOrders/>}/>
          <Route path="total_income" element={<TotalIncome/>}/>
        </Route>


        {/* admin routes */}

        <Route path='/admin/*'
        element={isLoggedIn && localStorage.getItem("role")==="admin"
        ? <AdminLayout logoutUser={logoutUser}/>
        : <Login setIsLoggedIn={setIsLoggedIn}/> }>

          <Route path="vendors" element={<VendorsManagement/>}/>
          <Route path="orders" element={<AdminOrders/>}/>
          {/*<Route path='add_agent' element={<AddDeliveryAgent/>}/>*/}
          <Route path='agents' element={<ManageAgents/>}/>

        </Route>

        <Route path='/agent/*' 
          element={isLoggedIn && localStorage.getItem("role")==="delivery_agent"
            ? <DeliveryAgentLayout logoutUser={logoutUser}/>
            : <Login setIsLoggedIn={setIsLoggedIn}/>}>
              <Route path="dashboard" element={<AgentDashboard/>}/>
              <Route path='orders' element={<AgentOrders/>}/>


        </Route>

      </Routes>
   </BrowserRouter>
  );

}

export default App;
