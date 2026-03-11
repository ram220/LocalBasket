import React from 'react'
import { Outlet } from 'react-router-dom'
import VendorTopNavbar from '../components/vendorComponents/VendorTopNavbar'
import VendorSideNavbar from '../components/vendorComponents/VendorSideNavbar'
import SubscriptionStatus from '../components/vendorComponents/SubscriptionStatus'
function VendorLayout({logoutUser}) {
  return (
    <>
        <VendorTopNavbar logoutUser={logoutUser}/>
        <div style={{ display: "flex" }}>
                <VendorSideNavbar />
                <main style={{ flex: 1, padding: "20px",}}>
                  <SubscriptionStatus/>
                    <Outlet /> {/* renders AddProducts, ViewProducts, etc. */}
                </main>
            </div>
    </>
  )
}

export default VendorLayout