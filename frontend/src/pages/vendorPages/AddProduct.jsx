import { useState } from "react";
import axios from 'axios';
import API_URL from "../../config";

function AddProduct() {
  const [formData,setFormData]=useState({
    name:"",
    price:"",
    category:"",
    description:"",
    expiryDate:"",
    keywords:"",
    isOffer: false,
    discountPercentage: ""
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange=(e)=>{
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
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
      data.append("isOffer", formData.isOffer);
      data.append("discountPercentage", formData.isOffer ? formData.discountPercentage : 0);

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
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
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
              style={{ border: "1px solid #ddd", borderRadius: "8px", width: "100%", padding: "10px" }}
            />
          </div>

          <div className="mt-2 text-dark">
            <h5>Product Category</h5>
            <select
              name="category" onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            >
              <option>Select Category</option>
              <option>Grocery</option>
              <option>Junk Foods</option>
              <option>Fruits & Juices</option>
              <option>Cool Drinks & Ice Creams</option>
              <option>Snacks</option>
            </select>
          </div>

          <div className="mt-2">
            <h5>Product Price</h5>
            <input
              type="number"
              min={0}
              name="price"
              onChange={handleChange}
              style={{ border: "1px solid #ddd", borderRadius: "8px", width: "100%", padding: "10px" }}
            />
          </div>

          <div className="mt-2">
            <h5>Product Keywords</h5>
            <input
              type="text"
              placeholder="Enter comma separated keywords"
              name="keywords"
              onChange={handleChange}
              style={{ border: "1px solid #ddd", borderRadius: "8px", width: "100%", padding: "10px" }}
            />
          </div>

          <div className="mt-2">
            <h5>Expiry Date</h5>
            <input
              type="date"
              name="expiryDate"
              onChange={handleChange}
              style={{ border: "1px solid #ddd", borderRadius: "8px", width: "100%", padding: "10px" }}
            />
          </div>

          <div className="mt-3 p-3" style={{ border: "1px solid #eee", borderRadius: "8px", background: "#fcfcfc" }}>
            <div className="d-flex align-items-center gap-2">
              <input
                type="checkbox"
                id="isOffer"
                name="isOffer"
                checked={formData.isOffer}
                onChange={handleChange}
                style={{ width: "20px", height: "20px" }}
              />
              <label htmlFor="isOffer" style={{ margin: 0, fontWeight: "bold" }}>Add Special Offer</label>
            </div>

            {formData.isOffer && (
              <div className="mt-2 animate__animated animate__fadeIn">
                <h5>Discount Percentage (%)</h5>
                <input
                  type="number"
                  placeholder="e.g. 10, 20, 50"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  style={{ border: "1px solid #ddd", borderRadius: "8px", width: "100%", padding: "10px" }}
                />
              </div>
            )}
          </div>


          <div className="mt-2">
            <h5>Product Description</h5>
            <textarea
              type="text"
              placeholder="Enter anything about the product"
              name="description"
              onChange={handleChange}
              style={{ border: "1px solid #ddd", borderRadius: "8px", width: "100%", height:"150px", padding: "10px"}}
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
