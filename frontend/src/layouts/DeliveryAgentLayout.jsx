import { Outlet } from "react-router-dom";
import AgentTopNavbar from "../components/deliveryAgentComponents/AgentTopNavbar";
import AgentSideNavbar from "../components/deliveryAgentComponents/AgentSideNavbar";

function DeliveryAgentLayout({logoutUser}){

    return(
        <>

            <AgentTopNavbar logoutUser={logoutUser}/>
            
            <div style={{display:"flex"}}>
                <AgentSideNavbar/>
                <main style={{flex:1,padding:"20px"}}>
                    <Outlet/>
                </main>
            </div>

        </>
    )
}

export default DeliveryAgentLayout;