import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";

function ViewProducts() {
    const [products,setProducts]=useState([]);
    const [page, setPage] = useState(1);
    const [totalPages,setTotalPages]=useState(1);

    const token=localStorage.getItem("token");

    useEffect(()=>{
        const fetchProducts=async()=>{
            try{
                const res=await axios.get(`${API_URL}/api/vendor/fetchProducts?page=${page}`,{
                    headers:{Authorization:`Bearer ${token}`}
                })
                setProducts(res.data.products.map((p)=>(
                  {...p, origainalPrice: p.price}
                )))
                setTotalPages(res.data.totalPages);
            }
            catch(err){
                const message=err.response?.data.message;
                alert(message);
            }
        }
        fetchProducts();
    },[page,token]);

    // update price

    const updatePrice = async(productId,newPrice)=>{
      try{
        const res=await axios.patch(`${API_URL}/api/vendor/updateProduct/${productId}`,{price:newPrice},{
          headers:{Authorization:`Bearer ${token}`}
        })
        const updatedProductName=res.data.updatedProduct.name;
        setProducts((prev)=>prev.map((prod)=> prod._id === productId ? { ...prod, price:res.data.updatedProduct.price, originalPrice: res.data.updatedProduct.price } : prod));

        alert(`price of ${updatedProductName} updated`)
      }
      catch(err){
        const message=err.response?.data.message;
        alert(message);
      }
    }


    const toggleStock=async(id,currentStock)=>{
        try{
            await axios.patch(`${API_URL}/api/vendor/updateProduct/${id}`,{inStock:!currentStock},{
                headers:{Authorization:`Bearer ${token}`}
            })

            setProducts((prev)=>
                prev.map((p)=> p._id === id ? {...p,inStock:!currentStock} : p)
            );
        }
        catch(err){
            alert(err.response?.data.message || "Something went wrong while updating product");
        }
    }

    const deleteProduct=async(productId)=>{
      try{
        const res=await axios.delete(`${API_URL}/api/vendor/deleteProduct/${productId}`,{
          headers:{Authorization:`Bearer ${token}`}
        });

        setProducts((prev)=>prev.filter((p)=>p._id !== productId));

        alert("product deleted successfully");

      }
      catch(err){
        const message=err.response?.data.message || "something went wrong while deleting product";
        alert(message);
      }

    }

  return (
    <div className="container-fluid py-4 h-100">
      <div className="card shadow-sm p-3 p-md-4 border-0" style={{ backgroundColor: "#fff", borderRadius: "16px" }}>
        <h4 className="fw-bold mb-4" style={{ color: "rgb(252, 107, 3)" }}>Product Management</h4>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>In Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  {/* product */}
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img src={p.image} alt={p.name} style={{width:"40px",height:"40px",objectFit:"cover", borderRadius:"4px"}}/>
                      <span className="text-truncate" style={{maxWidth: "150px"}}>{p.name}</span>
                    </div>
                  </td>

                  {/* category */}
                  <td>{p.category}</td>

                  {/* price */}
                  <td>
                    <div className="d-flex align-items-center gap-2">
                       <input 
                        type="number" 
                        className="form-control form-control-sm"
                        value={p.price} 
                        style={{width:"80px"}}
                        onChange={(e)=>{ setProducts((prev)=>
                          prev.map((prod)=> prod._id === p._id ? { ...prod, price: Number(e.target.value)} : prod))}}
                      />
                      <button className="btn btn-sm" 
                        style={{backgroundColor:"rgb(252, 107, 3)", color: "white", border:"none"}}
                        disabled={Number(p.price) === Number(p.originalPrice)}
                        onClick={()=>updatePrice(p._id, Number(p.price))}
                      >Update</button>
                    </div>
                  </td>

                  {/* stock toggle */}
                  <td>
                    <label className="switch">
                        <input type="checkbox" checked={p.inStock} onChange={()=>toggleStock(p._id,p.inStock)}/>
                        <span className="slider"></span>
                    </label>
                  </td>

                  {/* delete button */}
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={()=>deleteProduct(p._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-3 d-flex justify-content-center align-items-center gap-3">
          <button
            className="btn btn-sm btn-primary"
            disabled={page === 1}
            onClick={()=>setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-primary"
            disabled={page===totalPages}
            onClick={()=>setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Toggle switch CSS */}
      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
        }
        .switch input { display: none; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 20px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }
        input:checked + .slider { background-color: #4CAF50; }
        input:checked + .slider:before { transform: translateX(20px); }
      `}</style>

      
    </div>
  );
}

export default ViewProducts;
