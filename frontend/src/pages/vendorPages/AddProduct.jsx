import { useState } from "react";
import axios from 'axios';

function AddProduct() {

  const [formData,setFormData]=useState({
    name:"",
    price:"",
    category:"",
    description:"",
    expiryDate:"",
    keywords:""
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const API_URL="https://localbasket-multi-vendor-marketplace.onrender.com";
  //const API_URL="http://localhost:8000";

  const handleChange=(e)=>{
    setFormData({...formData, [e.target.name]: e.target.value})
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(loading) return;
    setLoading(true);
    try{
      const token=localStorage.getItem("token");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("expiryDate", formData.expiryDate);

      formData.keywords.split(",").forEach(k => {
        data.append("keywords", k.trim());
      });

      if (image) {
        data.append("image", image);
      }
      await axios.post(`${API_URL}/api/vendor/addProduct`,
        data,
        {
          headers: {Authorization:`Bearer ${token}`, "Content-Type": "multipart/form-data"}
        }
      );
      alert("product added successfully");
    }
    catch(err){
      const message=err.response?.data.message;
      alert(message);
    }
    finally{
      setLoading(false);
    }
  }
  return (
    <div style={{ maxWidth: "300px", margin: "20px" }}>
      <div className="p-2">
        <h5>Product Images</h5>
        <form onSubmit={handleSubmit}>
          <div className="d-flex gap-2">
              <div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImage(file);

                    if (file) {
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                 style={{ display: "none" }}/>
                <label
                  htmlFor="file-upload"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #ccc",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    width: "70px",
                    height: "70px",
                    cursor: "pointer",
                    overflow: "hidden",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {preview ? (
                    <img src={preview} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  ) : (
                    <small style={{ color: "#666" }}>Upload</small>
                  )}
                </label>
              </div>

          </div>

          <div className="mt-2">
            <h5>Product Name</h5>
            <input
              type="text"
              placeholder="Type here"
              name="name"
              onChange={handleChange}
              style={{ border: "1px solid", borderRadius: "3px", width: "230px" }}
            />
          </div>

          <div className="mt-2">
            <h5>Product Category</h5>
            <select
              name="category" onChange={handleChange}
              style={{ width: "230px" }}
            >
              <option>Select Category</option>
              <option>Grocery</option>
              <option>Junk Foods</option>
              <option>Medical</option>
              <option>Bakery</option>
              <option>Sweets</option>
              <option>Fruits & Juices</option>
            </select>
          </div>

          <div className="mt-2">
            <h5>Product Price</h5>
            <input
              type="number"
              min={0}
              name="price"
              onChange={handleChange}
              style={{ border: "1px solid", borderRadius: "3px", width: "230px" }}
            />
          </div>

          <div className="mt-2">
            <h5>Product Keywords</h5>
            <input
              type="text"
              placeholder="Enter comma separated keywords"
              name="keywords"
              onChange={handleChange}
              style={{ border: "1px solid", borderRadius: "3px", width: "230px" }}
            />
          </div>

          <div className="mt-2">
            <h5>Expiry Date</h5>
            <input
              type="date"
              name="expiryDate"
              onChange={handleChange}
              style={{ border: "1px solid", borderRadius: "3px", width: "230px" }}
            />
          </div>


          <div className="mt-2">
            <h5>Product Description</h5>
            <textarea
              type="text"
              placeholder="Enter anything about the product"
              name="description"
              onChange={handleChange}
              style={{ border: "1px solid", borderRadius: "3px", width: "500px", height:"150px"}}
            />
          </div>

          <button
            className="mt-3"
            type="submit"
            disabled={loading}
            style={{
              padding: "8px 16px",
              marginTop: "10px",
              backgroundColor: loading ? "#ccc" :"rgb(255, 107, 2)",
              border: "none",
              borderRadius: "3px",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {/*{loading ? "Uploading..." : "Add"}*/}
            {loading ? (
  <>
    <span className="spinner-border spinner-border-sm me-2"></span>
    Uploading...
  </>
) : (
  "Add"
)}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
