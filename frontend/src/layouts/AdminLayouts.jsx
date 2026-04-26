import { Outlet } from "react-router-dom";
import AdminTopNavbar from "../components/adminComponents/AdminTopNavbar";
import AdminSideNavbar from "../components/adminComponents/AdminSideNavbar";

function AdminLayout({logoutUser}){

    return(
        <>

        <AdminTopNavbar logoutUser={logoutUser}/>
        <div className="main-layout-container">
            <main style={{flex:1,padding:"20px", minWidth: 0}}>
                <Outlet/>
            </main>
        </div>

        </>
    )
}

export default AdminLayout;