import { Link } from "react-router-dom";

function AgentSideNavbar(){

    return(
        <div className="sidenav p-4" style={{backgroundColor:"whitesmoke"}}>

            <div className="back mt-3">
                <Link className="d-block mb-2" to="/agent/orders">
                    <strong><h6>View Assigned orders</h6></strong>
                </Link>
            </div>
            

        </div>
    )
}

export default AgentSideNavbar;