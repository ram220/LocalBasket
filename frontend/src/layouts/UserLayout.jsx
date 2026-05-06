import React from 'react'
import TopNavBar from '../components/userComponents/TopNavBar'
import BottomNavBar from '../components/userComponents/BottomNavBar'
import { Outlet, Navigate } from 'react-router-dom'
import Chatbot from '../pages/userPages/Chatbot'

function UserLayout({isLoggedIn,logoutUser,cart,setCart,fetchCart}) {
  const role = localStorage.getItem("role");

  // If someone is logged in but is NOT a "user", redirect them to their dashboard
  if (isLoggedIn && role && role !== "user") {
    if (role === "admin") return <Navigate to="/admin/vendors" replace />;
    if (role === "vendor") return <Navigate to="/vendor" replace />;
    if (role === "delivery_agent") return <Navigate to="/agent/dashboard" replace />;
  }
  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNavBar isLoggedIn={isLoggedIn} logoutUser={logoutUser} cart={cart}/>
        <Chatbot setCart={setCart}/>
        <main className="main-content">
            <Outlet context={{fetchCart}}/>
        </main>
        <BottomNavBar cartCount={cart.length} />
    </div>
  )
}

export default UserLayout