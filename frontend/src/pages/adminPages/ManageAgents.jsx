import {useEffect,useState} from "react";
import axios from "axios";

function ManageAgents(){

    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
    //const API_URL="http://localhost:8000";
    const token=localStorage.getItem("token");

    const [agents,setAgents]=useState([]);

    const fetchAgents = async()=>{
        const res = await axios.get(`${API_URL}/api/admin/getAllAgents`,{
            headers:{Authorization:`Bearer ${token}`}
        })

        setAgents(res.data.agents);
    }

    useEffect(()=>{
        fetchAgents();
    },[])

    const approveAgent = async(id)=>{
        await axios.patch(`${API_URL}/api/admin/approveAgent/${id}`,{},{
            headers:{Authorization:`Bearer ${token}`}
        })

        fetchAgents();
    }

    const deleteAgent = async(id)=>{
        await axios.delete(`${API_URL}/api/admin/deleteAgent/${id}`,{
            headers:{Authorization:`Bearer ${token}`}
        })

        fetchAgents();
    }

    return(

        <div className="table-responsive">

            <h3 className="mb-4">Delivery Agents</h3>

            {agents.length == 0 ? (<p className="mt-3">No Delivery agents</p>)
            :(
                <table className="table table-bordered">

                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    {agents.map(a=>(
                        <tr key={a._id}>

                            <td>{a.name}</td>
                            <td>{a.email}</td>
                            <td>{a.mobile}</td>
                            <td>{a.status}</td>

                            <td>

                                <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={()=>approveAgent(a._id)}
                                >
                                    Approve
                                </button>

                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={()=>deleteAgent(a._id)}
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>
            )}

        </div>

    )

}

export default ManageAgents;