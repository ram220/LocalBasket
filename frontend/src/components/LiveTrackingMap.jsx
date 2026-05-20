import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { io } from "socket.io-client";
import API_URL from "../config";

// Fix Leaflet's default marker icon search path bug with React asset bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Premium and recognizable map marker icons
const agentIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png", // Motorbike icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const vendorIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/869/869636.png", // Store / shop icon
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

const homeIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946436.png", // House pin icon
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

function LiveTrackingMap({ orderId, vendorLoc, userLoc, initialAgentLoc }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const socketRef = useRef(null);

    // Track active coordinates
    const [agentCoordinates, setAgentCoordinates] = useState(initialAgentLoc || null);
    const markersRef = useRef({ agent: null, vendor: null, user: null, path: null });

    useEffect(() => {
        // Fallback to Vijayawada area coords if lat/lng are undefined
        const userLat = userLoc?.lat || 16.5062;
        const userLng = userLoc?.lng || 80.6480;
        const vendorLat = vendorLoc?.lat || 16.5075;
        const vendorLng = vendorLoc?.lng || 80.6475;

        // Initialize leaflet map centered around the delivery point
        if (!mapInstance.current && mapRef.current) {
            mapInstance.current = L.map(mapRef.current).setView([userLat, userLng], 14);

            // Load smooth OpenStreetMap tile layouts
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            // Place static vendor shop and user home pins
            markersRef.current.vendor = L.marker([vendorLat, vendorLng], { icon: vendorIcon })
                .addTo(mapInstance.current)
                .bindPopup("<b>🏪 Shop (Pickup Location)</b>");

            markersRef.current.user = L.marker([userLat, userLng], { icon: homeIcon })
                .addTo(mapInstance.current)
                .bindPopup("<b>🏠 Home (Delivery Location)</b>");
        }

        // Connect Socket.IO to backend server (using configured API_URL)
        socketRef.current = io(API_URL);
        socketRef.current.emit("join_order_room", { orderId });

        // Update coordinates dynamically when broadcast received
        socketRef.current.on("agent_location_broadcasted", (data) => {
            const { lat, lng } = data;
            if (lat && lng) {
                setAgentCoordinates({ lat, lng });
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [orderId, vendorLoc, userLoc]);

    // Track real-time movement and draw delivery routes dynamically
    useEffect(() => {
        if (!mapInstance.current) return;

        const userLat = userLoc?.lat || 16.5062;
        const userLng = userLoc?.lng || 80.6480;
        const vendorLat = vendorLoc?.lat || 16.5075;
        const vendorLng = vendorLoc?.lng || 80.6475;

        const points = [];
        points.push([vendorLat, vendorLng]);

        if (agentCoordinates && agentCoordinates.lat && agentCoordinates.lng) {
            const { lat, lng } = agentCoordinates;
            points.push([lat, lng]);

            // Update or create delivery agent motorbike icon
            if (markersRef.current.agent) {
                markersRef.current.agent.setLatLng([lat, lng]);
            } else {
                markersRef.current.agent = L.marker([lat, lng], { icon: agentIcon })
                    .addTo(mapInstance.current)
                    .bindPopup("<b>🚴 Delivery Agent Location</b>");
            }
        }

        points.push([userLat, userLng]);

        // Draw dynamic path overlay
        if (markersRef.current.path) {
            markersRef.current.path.setLatLngs(points);
        } else {
            markersRef.current.path = L.polyline(points, {
                color: "#fc6b03",
                weight: 4,
                dashArray: "6, 8",
                opacity: 0.8
            }).addTo(mapInstance.current);
        }

        // Adjust bounds to fit all elements perfectly
        const activeMarkers = [markersRef.current.vendor, markersRef.current.user];
        if (markersRef.current.agent) activeMarkers.push(markersRef.current.agent);

        const group = new L.featureGroup(activeMarkers);
        mapInstance.current.fitBounds(group.getBounds().pad(0.15));

    }, [agentCoordinates, vendorLoc, userLoc]);

    return (
        <div className="card shadow-sm border-0 overflow-hidden mb-3" style={{ borderRadius: "12px" }}>
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <span className="fw-bold d-flex align-items-center">
                    <span className="spinner-grow spinner-grow-sm text-success me-2" role="status" aria-hidden="true" style={{ width: "10px", height: "10px" }} />
                    Live Delivery Tracking Map
                </span>
                <span className="badge bg-light text-dark border">Socket.IO Active</span>
            </div>
            <div className="position-relative" style={{ width: "100%", height: "350px" }}>
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                <div 
                    className="position-absolute bg-white px-3 py-2 shadow-sm rounded-pill d-flex align-items-center gap-2"
                    style={{
                        bottom: "16px",
                        left: "16px",
                        zIndex: 1000,
                        fontSize: "13px",
                        fontWeight: "600"
                    }}
                >
                    <span style={{ color: "#2ed573" }}>●</span> 
                    {agentCoordinates ? "Agent is on the move" : "Waiting for agent to share GPS"}
                </div>
            </div>
        </div>
    );
}

export default LiveTrackingMap;
