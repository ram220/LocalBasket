import { useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function AddDeliveryAgent(){
    const token=localStorage.getItem("token");

    const [form,setForm]=useState({
        name:"",
        email:"",
        mobile:"",
        address:""
    });

    const handleChange=(e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();

        try{

            const res=await axios.post(`${API_URL}/api/admin/add_delivery_agent`,
                form,
                {headers:{Authorization:`Bearer ${token}`}}
            );
            alert("Delivery Agent created");
            console.log(res.data);
            setForm({
                name:"",
                email:"",
                mobile:"",
                address:""
            });

        }
        catch(err){
            alert(err.response?.data?.message || "Error creating agent");
        }
    }

    return(

        <div className="container">

            <h3>Add Delivery Agent</h3>

            <form onSubmit={handleSubmit} className="mt-3">

                <input
                className="form-control mb-2"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
                />

                <input
                className="form-control mb-2"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                />

                <input
                className="form-control mb-2"
                name="mobile"
                placeholder="Mobile"
                value={form.mobile}
                onChange={handleChange}
                required
                />

                <input
                className="form-control mb-3"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                required
                />

                <button className="btn btn-primary">
                    Create Agent
                </button>

            </form>

        </div>

    )
}

export default AddDeliveryAgent;