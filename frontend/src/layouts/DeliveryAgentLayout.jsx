import { Outlet } from "react-router-dom";
import AgentTopNavbar from "../components/deliveryAgentComponents/AgentTopNavbar";
import AgentSideNavbar from "../components/deliveryAgentComponents/AgentSideNavbar";

function DeliveryAgentLayout({logoutUser}){

    return(
        <>

            <AgentTopNavbar logoutUser={logoutUser}/>
            
            <div className="main-layout-container">
                <main style={{flex:1,padding:"20px", minWidth: 0}}>
                    <Outlet/>
                </main>
            </div>

        </>
    )
}

export default DeliveryAgentLayout;