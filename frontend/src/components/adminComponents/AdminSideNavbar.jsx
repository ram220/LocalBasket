import { Link } from "react-router-dom";

function AdminSideNavbar(){

    return(
        <div className="sidenav p-4" style={{backgroundColor:"whitesmoke"}}>

            <div className="back mt-3">
                <Link className="d-block mb-2" to="/admin/vendors">
                    <strong><h6>Manage Vendors</h6></strong>
                </Link>
            </div>
            <div className="back mt-3">
                <Link className="d-block" to="/admin/orders">
                    <h6>Orders</h6>
                </Link>
            </div>
            {/*<div className="back mt-3">
                <Link className="d-block" to="/admin/add_agent">
                    <h6>Add Agent</h6>
                </Link>
            </div>*/}
            <div className="back mt-3">
                <Link className="d-block" to="/admin/agents">
                <h6>Manage Agents</h6>
                </Link>
            </div>


        </div>
    )
}

export default AdminSideNavbar;