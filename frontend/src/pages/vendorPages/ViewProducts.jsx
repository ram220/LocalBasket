import { useState, useEffect } from "react";
import axios from "axios";

function ViewProducts() {
    const [products,setProducts]=useState([]);
    const [page, setPage] = useState(1);
    const [totalPages,setTotalPages]=useState(1);

    const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
    //const API_URL="http://localhost:8000";

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

  return (
    <div className="p-3">
      <h5>All Products</h5>
      <div
        className="container ms-0 p-2"
        style={{
          backgroundColor: "whitesmoke",
          width: "700px",
          minHeight: "400px",
        }}
      >
        {/* Headers */}
        <div
          className="d-flex p-2"
          style={{ fontWeight: "bold", borderBottom: "1px solid #ccc" }}
        >
          <div style={{ flex: 2 }}>Product</div>
          <div style={{ flex: 1 }}>Category</div>
          <div style={{ flex: 1 }}>Price</div>
          <div style={{ flex: 1 }}>In Stock</div>
        </div>

        {/* Products */}
        {
            products.map((p)=>(
                <div key={p._id} className="d-flex align-items-center p-2" style={{borderBottom:"1px solid #eee"}}>
                    {/* product */}
                    <div style={{flex:2}} className="d-flex align-items-center gap-2">
                        <img src={p.image} alt={p.name} style={{width:"40px",height:"40px",objectFit:"cover", borderRadius:"4px"}}/>
                        <span>{p.name}</span>
                    </div>

                    {/* category */}
                    <div style={{flex:1}}>{p.category}</div>

                    {/* price */}
                    <div style={{flex:1, display:"flex", alignItems:"center"}}>
                      <input type="number" value={p.price} style={{width:"60px"}}
                          onChange={(e)=>{ setProducts((prev)=>
                                    prev.map((prod)=> prod._id === p._id ? { ...prod, price: Number(e.target.value)} : prod))}}/>
                      <button className="btn btn-sm btn-secondary" 
                          style={{backgroundColor:"#fa6704ff",border:"none"}}
                          disabled={Number(p.price) === Number(p.originalPrice)}
                          onClick={()=>updatePrice(p._id, Number(p.price))}
                          >update</button>
                    </div>

                    {/* stock toggle */}
                    <div style={{flex:1}}>
                        <label className="switch">
                            <input type="checkbox" checked={p.inStock} onChange={()=>toggleStock(p._id,p.inStock)}/>
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            ))
        }

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
