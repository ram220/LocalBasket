import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import axios from "axios";
import API_URL from "../../config";

function OrderSummary({ cart,setCart }) {
  const [address,setAddress]=useState("");
  const [mobile,setMobile]=useState("");
  const [loading,setLoading]=useState(false);
  const navigate=useNavigate()

  const [paymentMethod,setPaymentMethod] = useState("COD");
  
  // Geolocation Map Pinpoint States
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const token=localStorage.getItem("token");

  useEffect(()=>{
    const fetchUserDeatils=async()=>{
      if(!token){
        return;
      }
      try{
        const res=await axios.get(`${API_URL}/api/user/get_user_details`,{
          headers:{Authorization:`Bearer ${token}`}
        })

        setAddress(res.data.address);
        setMobile(res.data.mobile);
      }
      catch(err){
        const message=err.response?.data.message || "something went wrong while fetching your address";
        alert(message)
      }
    }
    fetchUserDeatils();
  },[token])

  // Initialize Map Picker Leaflet instances
  useEffect(() => {
    if (showMapPicker && mapRef.current && !mapInstance.current) {
      const defaultLat = 16.5062;
      const defaultLng = 80.6480;

      const initMap = (lat, lng) => {
        if (mapInstance.current) return;

        // 🗺️ Standard schematic map layer
        const standardLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        // 🛰️ Esri Satellite Imagery + Labels + Roads (Hybrid View) Layer Group
        const hybridLayer = L.layerGroup([
          // Base Satellite Layer
          L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"),
          // Transparent Village, City, and State Labels Overlay
          L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"),
          // Transparent Road and Street Names Overlay
          L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}")
        ]);

        // Initialize map with Hybrid view by default (zoom 17 is perfect for seeing houses, fields, and labels)
        // Set attributionControl to false to hide the bulky text at the bottom-right
        mapInstance.current = L.map(mapRef.current, {
          center: [lat, lng],
          zoom: 17,
          layers: [hybridLayer],
          attributionControl: false
        });

        // Add a clean, collapsed layer switcher icon/menu in the top-right corner
        const baseMaps = {
          "🛰️ Hybrid View (Satellite + Labels)": hybridLayer,
          "🗺️ Standard Map (Roads & Names)": standardLayer
        };
        L.control.layers(baseMaps, null, { collapsed: true }).addTo(mapInstance.current);

        const pinIcon = new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946436.png", // House Pin Icon
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });

        markerRef.current = L.marker([lat, lng], { 
          draggable: true,
          icon: pinIcon
        }).addTo(mapInstance.current);

        setSelectedCoords({ lat, lng });

        // Update when marker is dragged
        markerRef.current.on("dragend", () => {
          const position = markerRef.current.getLatLng();
          setSelectedCoords({ lat: position.lat, lng: position.lng });
        });

        // Update when map is clicked
        mapInstance.current.on("click", (e) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
          setSelectedCoords({ lat, lng });
        });

        // Force Leaflet to recalculate container dimensions after rendering in browser DOM
        setTimeout(() => {
          if (mapInstance.current) {
            mapInstance.current.invalidateSize();
          }
        }, 300);
      };

      // Initialize map instantly with fallback coordinates so it displays immediately
      initMap(defaultLat, defaultLng);

      // Upgrade to precise live geolocation coordinates asynchronously
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (mapInstance.current && markerRef.current) {
              mapInstance.current.setView([latitude, longitude], 17);
              markerRef.current.setLatLng([latitude, longitude]);
              setSelectedCoords({ lat: latitude, lng: longitude });
              
              // Force size invalidation again after flying to new position to ensure perfect tile alignment
              setTimeout(() => {
                if (mapInstance.current) {
                  mapInstance.current.invalidateSize();
                }
              }, 100);
            }
          },
          (error) => {
            console.log("Geolocation error or blocked, remaining at default:", error);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [showMapPicker]);

  const requestPreciseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapInstance.current && markerRef.current) {
            mapInstance.current.setView([latitude, longitude], 17);
            markerRef.current.setLatLng([latitude, longitude]);
            setSelectedCoords({ lat: latitude, lng: longitude });
            
            // Force Leaflet container dimensions recalculation to align map tiles
            setTimeout(() => {
              if (mapInstance.current) {
                mapInstance.current.invalidateSize();
              }
            }, 100);
          }
        },
        (error) => {
          alert("Could not retrieve precise location. Please ensure location services are turned ON and permissions are allowed for LocalBasket in your browser settings.");
          console.log("Precise GPS Retrieval Error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser or device.");
    }
  };

  const itemsTotal = cart.reduce((total,item)=>{
    return total + item.finalPrice * item.quantity;
  },0);

  const vendorSubtotals = {};
  cart.forEach(item => {
      const vId = item.vendorId?._id || item.productId?.vendorId?._id || item.productId?.vendorId || "unknown";
      const vName = item.vendorId?.shopName || item.productId?.vendorId?.shopName || "this shop";
      if (!vendorSubtotals[vId]) vendorSubtotals[vId] = { amount: 0, name: vName };
      vendorSubtotals[vId].amount += item.finalPrice * item.quantity;
  });

  let vendorProtectionFee = 0;
  let vendorWarnings = [];
  Object.values(vendorSubtotals).forEach(sub => {
      if (sub.amount > 0 && sub.amount < 100) {
          vendorProtectionFee += 15;
          vendorWarnings.push(`Add ₹${100 - sub.amount} more from ${sub.name} to remove the Small Shop fee`);
      }
  });

  const PLATFORM_FEE = 10;
  let DELIVERY_CHARGE = 15; // default
  if(itemsTotal >= 200) {
      DELIVERY_CHARGE = 0;
  } else if(itemsTotal >= 100) {
      DELIVERY_CHARGE = 15;
  }

  const total = itemsTotal + DELIVERY_CHARGE + PLATFORM_FEE + vendorProtectionFee;

  const handlePlaceOrder = async()=>{
    if(loading) return;
    if(cart.length === 0){
        alert("Cart is empty, add items to cart and try");
        return;
    }

    if(itemsTotal<100){
      alert("Minimum order amount is ₹100");
      return;
    }

        setLoading(true);

    const orderData = {
        items: cart.map(item=>({
            productId:item.productId._id,
            name:item.productId.name,
            quantity:item.quantity,
            price:item.finalPrice,
            image:item.productId.image,
            vendorId:item.vendorId._id  
        })),
        itemsTotal,
        deliveryCharge: DELIVERY_CHARGE,
        platformFee: PLATFORM_FEE,
        vendorProtectionFee: vendorProtectionFee,
        totalAmount: total,
        paymentMethod,
        // Inject accurate delivery geolocation map coordinates if marked
        deliveryLocation: selectedCoords ? {
            type: "Point",
            coordinates: [selectedCoords.lng, selectedCoords.lat] // [longitude, latitude]
        } : undefined
    };
    try{
      if(paymentMethod==="COD"){
        await axios.post(`${API_URL}/api/orders/placeOrder`,orderData,{
          headers:{Authorization: `Bearer ${token}`}
        });

        alert("Order placed Successfully");
        setCart([]);
        
        return
      }
      if(paymentMethod==="UPI"){
        const razorOrder=await axios.post(`${API_URL}/api/orders/create-razorpay-order`,
          {amount:total},
          {headers:{Authorization:`Bearer ${token}`}}
        );

        
        const options={
          key:"rzp_live_RMI6AqNDqxjfS8",
          amount:razorOrder.data.amount,
          currency:"INR",
          name:"Localbasket",
          description:"Order Payment",
          order_id:razorOrder.data.id,

          handler:async function(response) {
            await axios.post(`${API_URL}/api/orders/placeOrder`,
              {
                ...orderData,
                paymentMethod:"UPI",
                paymentStatus:"Completed"
              },{
                headers:{Authorization:`Bearer ${token}`}
              }
            );

            alert("Payment Successful & Order Placed");
            setCart([]);
            
          }
        }
        const razor = new window.Razorpay(options);
        razor.open();
      }
    }
    catch(err){
      const message=err.response?.data.message || "something went wrong while placing your order";
      alert(message);
    }
    finally{
      setLoading(false);
    }
  }


  return (
    <div className="container mt-4 mb-5 px-3">
      <div className="card shadow-sm p-4 border-0" style={{ borderRadius: "16px", backgroundColor: "#fff" }}>
        <h5 className="fw-bold mb-4" style={{ color: "rgb(252, 107, 3)" }}>Order Summary</h5>

        {/* Delivery Address */}
        <div className="mb-4 p-3 rounded-3" style={{ background: "rgba(252, 107, 3, 0.05)" }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">Delivery Address</h6>
            <button
              className="btn btn-link p-0 text-decoration-none fw-bold"
              onClick={()=>navigate('/update_details')}
              style={{ color: "rgb(252, 107, 3)", fontSize: "0.9rem" }}
            >
              Change
            </button>
          </div>
          <p className="mb-1 text-muted small">{address ? address : "No Address Found"}</p>
          {mobile && <p className="mb-2 text-muted small">📞 {mobile}</p>}

          {/* Map Pinpoint picker */}
          <div className="border-top pt-2 mt-2">
            <div className="d-flex justify-content-between align-items-center">
              <span className="small fw-bold text-dark">📍 Pin Exact Location on Map:</span>
              <button 
                className="btn btn-sm btn-outline-warning py-1 px-2 font-monospace"
                style={{ fontSize: "0.75rem", borderRadius: "6px" }}
                onClick={() => setShowMapPicker(!showMapPicker)}
              >
                {showMapPicker ? "Close Map" : "Open Map Picker"}
              </button>
            </div>
            
            {showMapPicker && (
              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                    💡 Drag the pin or tap on the map to pinpoint your house.
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm text-white fw-bold shadow-sm"
                    style={{ 
                      fontSize: "0.75rem", 
                      borderRadius: "6px", 
                      height: "26px", 
                      lineHeight: "1.2",
                      backgroundColor: "rgb(252, 107, 3)", 
                      borderColor: "rgb(252, 107, 3)",
                      padding: "2px 8px"
                    }}
                    onClick={requestPreciseLocation}
                  >
                    🎯 Locate Me
                  </button>
                </div>
                <div 
                  ref={mapRef} 
                  style={{ width: "100%", height: "200px", borderRadius: "8px", border: "1px solid #ccc", zIndex: 10 }} 
                />
              </div>
            )}

            {selectedCoords && (
              <div className="mt-2 alert alert-success py-1 px-2 mb-0 fw-bold" style={{ fontSize: "0.75rem", borderRadius: "6px" }}>
                🎯 Precise Delivery Location Pinmarked!
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <h6 className="fw-bold mb-2">Payment Method</h6>
          <select
            className="form-select"
            value={paymentMethod}
            onChange={(e)=>setPaymentMethod(e.target.value)}
            style={{ borderRadius: "8px" }}
          >
            <option value="COD">Cash On Delivery</option>
            <option value="UPI">UPI (Razorpay)</option>
          </select>
        </div>

        {/* Price Breakdown */}
        <div className="border-top pt-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Items Total</span>
            <span className="fw-semibold">₹{itemsTotal}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Platform Fee</span>
            <span className="fw-semibold">₹{PLATFORM_FEE}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Delivery Charge</span>
            <span className="fw-semibold">
              {DELIVERY_CHARGE === 0 ? <span className="text-success">Free</span> : `₹${DELIVERY_CHARGE}`}
            </span>
          </div>
          {itemsTotal >= 100 && itemsTotal < 200 && (
            <p className="small mb-3 p-1 rounded" style={{ backgroundColor: "#e2f3e5", color: "#28a745", fontSize: "0.8rem", textAlign: "right" }}>
              🎉 Add ₹{200 - itemsTotal} more for Free Delivery!
            </p>
          )}

          {vendorProtectionFee > 0 && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Small Shop Order Fee</span>
            <span className="fw-semibold text-danger">₹{vendorProtectionFee}</span>
          </div>
          )}
          {vendorWarnings.map((warn, i) => (
            <p key={i} className="small mb-3 p-1 rounded" style={{ backgroundColor: "#fff3cd", color: "#856404", fontSize: "0.8rem", textAlign: "right" }}>
              ⚠️ {warn}
            </p>
          ))}

          <hr className="my-3" />

          <div className="d-flex justify-content-between align-items-end">
            <span className="fw-bold h5 mb-0">Total Amount</span>
            <div className="text-end">
              <span className="fw-bold h5 mb-0" style={{ color: "rgb(252, 107, 3)" }}>₹{total}</span>
            </div>
          </div>
          {itemsTotal < 100 && (
            <p className="text-danger small mt-2 mb-0">Minimum order amount should be ₹100</p>
          )}
        </div>

        {/* Place Order Button */}
        <button
          className="btn btn-lg w-100 mt-4 text-white fw-bold shadow-sm"
          onClick={handlePlaceOrder}
          disabled={loading || itemsTotal < 100}
          style={{
            background: loading ? "#ccc" : "rgb(252, 107, 3)",
            borderRadius: "12px",
            border: "none",
            height: "50px",
            transition: "all 0.3s ease"
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Placing Order...
            </>
          ) : (
            "Place Order"
          )}
        </button>
      </div>
    </div>
  );
}
export default OrderSummary;
