import { useEffect, useState } from "react";
import axios from "axios";

function VendorsManagement(){

    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com"

    //const API_URL="http://localhost:8000";

    const [vendors,setVendors]=useState([]);

    const token=localStorage.getItem("token");

    const fetchVendors=async()=>{
        try{

            const res=await axios.get(`${API_URL}/api/admin/getAllVendors`,{
                headers:{Authorization:`Bearer ${token}`}
            })

            setVendors(res.data.vendors)

        }
        catch(err){
            alert("error fetching vendors")
        }
    }

    useEffect(()=>{
        fetchVendors();
    },[])

    const approveVendor=async(id)=>{
        await axios.patch(`${API_URL}/api/admin/approveVendor/${id}`,{},{
            headers:{Authorization:`Bearer ${token}`}
        })
        fetchVendors();
    }

    const rejectVendor=async(id)=>{
        await axios.patch(`${API_URL}/api/admin/rejectVendor/${id}`,{},{
            headers:{Authorization:`Bearer ${token}`}
        })
        fetchVendors();
    }

    const deleteVendor=async(id)=>{
        await axios.delete(`${API_URL}/api/admin/deleteVendor/${id}`,{
            headers:{Authorization:`Bearer ${token}`}
        })
        fetchVendors();
    }

    const activateVendor=async(id)=>{
        await axios.patch(`${API_URL}/api/admin/activateSubscription/${id}`,{},{
            headers:{Authorization:`Bearer ${token}`}
        })
        fetchVendors();
    }

    return(
        <>
            <h3 className="mb-4">Vendor Management</h3>
            {
                vendors.length >0 ?(
                    <div className="table-responsive">


                        <table className="table table-bordered">

                            <thead>

                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Vendor Status</th>
                                    <th>Plan</th>
                                    <th>Days Left</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {vendors.map(v=>(
                                    <tr key={v._id}>

                                        <td>{v.name}</td>

                                        <td>{v.email}</td>

                                        <td>{v.status}</td>

                                        <td>
                                            {v.subscriptionStatus ? v.subscriptionStatus : "inactive"}
                                        </td>

                                        <td>
                                            {v.daysLeft !== undefined ? v.daysLeft : "-"}
                                        </td>

                                        <td className="d-flex flex-wrap gap-2">

                                            <button
                                            className="btn btn-success btn-sm me-2"
                                            onClick={()=>approveVendor(v._id)}
                                            >
                                                Approve
                                            </button>

                                            <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={()=>rejectVendor(v._id)}
                                            >
                                                Reject
                                            </button>

                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={()=>activateVendor(v._id)}
                                                >
                                                Activate Plan
                                            </button>

                                            <button
                                            className="btn btn-danger btn-sm"
                                            onClick={()=>deleteVendor(v._id)}
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )
                :
                (<p>No Vendors found</p>)
            }
        </>
    )
}

export default VendorsManagement;