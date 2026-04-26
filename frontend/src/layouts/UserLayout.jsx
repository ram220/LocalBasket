import React from 'react'
import TopNavBar from '../components/userComponents/TopNavBar'
import BottomNavBar from '../components/userComponents/BottomNavBar'
import { Outlet } from 'react-router-dom'
import Chatbot from '../pages/userPages/Chatbot'

function UserLayout({isLoggedIn,logoutUser,cart,setCart,fetchCart}) {
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