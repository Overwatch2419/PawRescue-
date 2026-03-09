import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { addReport } from "../services/rescueService";
import Button from "../components/Button";

// Reverse geocode lat/lng → human-readable address via OpenStreetMap Nominatim
async function reverseGeocode(lat, lng) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        return data.display_name || "";
    } catch {
        return "";
    }
}

// Component to pick location from map
function LocationPicker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

function Report() {
    const [formData, setFormData] = useState({
        animalType: "Dog",
        urgency: "Stable",
        description: "",
        contactInfo: "",
        address: "",
        location: { lat: 23.0225, lng: 72.5714 },
        media: null,
    });

    const [status, setStatus] = useState({ type: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [geocoding, setGeocoding] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Called when map is clicked — updates coords AND reverse geocodes to address
    const handleLocationChange = async (latlng) => {
        setFormData((prev) => ({
            ...prev,
            location: { lat: latlng.lat, lng: latlng.lng },
        }));
        setGeocoding(true);
        const addr = await reverseGeocode(latlng.lat, latlng.lng);
        setFormData((prev) => ({ ...prev, address: addr || prev.address }));
        setGeocoding(false);
    };

    // GPS detect — fetches real address automatically
    const detectLocation = () => {
        setStatus({ type: "loading", message: "Detecting your location... 🛰️" });

        if (!navigator.geolocation) {
            setStatus({ type: "error", message: "Geolocation not supported by browser" });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setFormData((prev) => ({
                    ...prev,
                    location: { lat: latitude, lng: longitude },
                }));

                setStatus({ type: "loading", message: "Fetching address... 🗺️" });
                setGeocoding(true);
                const addr = await reverseGeocode(latitude, longitude);
                setGeocoding(false);

                setFormData((prev) => ({
                    ...prev,
                    address: addr || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                }));

                setStatus({ type: "success", message: "Location detected! 📍" });
                setTimeout(() => setStatus({ type: "", message: "" }), 3000);
            },
            (error) => {
                setStatus({ type: "error", message: "Location error: " + error.message });
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: "loading", message: "Submitting report... 🐾" });

        try {
            // Convert to FormData to support file upload
            const data = new FormData();
            data.append("animalType", formData.animalType);
            data.append("urgency", formData.urgency);
            data.append("description", formData.description);
            data.append("contactInfo", formData.contactInfo);
            data.append("address", formData.address);
            data.append("location", JSON.stringify(formData.location));
            if (formData.media) {
                data.append("media", formData.media);
            }

            await addReport(data);
            setStatus({ type: "success", message: "Report submitted successfully! 🐾" });
            setFormData({
                animalType: "Dog",
                urgency: "Stable",
                description: "",
                contactInfo: "",
                address: "",
                location: { lat: 23.0225, lng: 72.5714 },
                media: null,
            });
            setTimeout(() => setStatus({ type: "", message: "" }), 5000);
        } catch (error) {
            setStatus({ type: "error", message: "Failed to submit: " + error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="report-container">
            <h2>Report Injured Animal 🐾</h2>
            <p>Help us locate the animal by providing detailed info.</p>

            <form onSubmit={handleSubmit} className="report-form">

                <div className="form-group">
                    <label>Animal Type:</label>
                    <select name="animalType" value={formData.animalType} onChange={handleChange}>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Cow">Cow</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Urgency Level:</label>
                    <select name="urgency" value={formData.urgency} onChange={handleChange}>
                        <option value="Critical">Critical</option>
                        <option value="Serious">Serious</option>
                        <option value="Stable">Stable</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        placeholder="Describe the condition..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Upload Media (Optional):</label>
                    <input
                        type="file"
                        name="media"
                        accept="image/*,video/*"
                        onChange={handleChange}
                    />
                    <small style={{ color: "#888", marginTop: "4px", display: "block" }}>
                        Add a photo or video of the animal
                    </small>
                </div>

                <div className="form-group">
                    <label>Upload Media (Optional):</label>
                    <input
                        type="file"
                        name="media"
                        accept="image/*,video/*"
                        onChange={handleChange}
                    />
                    <small style={{ color: "#888", marginTop: "4px", display: "block" }}>
                        Add a photo or video of the animal
                    </small>
                </div>

                <div className="form-group">
                    <label>Contact Info:</label>
                    <input
                        type="text"
                        name="contactInfo"
                        placeholder="Phone or Name"
                        value={formData.contactInfo}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Rescue Location:</label>

                    <Button onClick={detectLocation} type="button">
                        📍 Detect My Location
                    </Button>

                    {/* Auto-filled address — editable by user */}
                    <input
                        type="text"
                        name="address"
                        placeholder={geocoding ? "Fetching address..." : "Address will appear here, or type manually..."}
                        value={formData.address}
                        onChange={handleChange}
                        style={{ marginTop: "10px" }}
                        disabled={geocoding}
                    />

                    <small style={{ color: "#888", marginTop: "4px", display: "block" }}>
                        Or click the map to pin the exact spot
                    </small>

                    <MapContainer
                        center={[formData.location.lat, formData.location.lng]}
                        zoom={13}
                        style={{ height: "250px", width: "100%", marginTop: "10px" }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker
                            position={formData.location}
                            setPosition={handleLocationChange}
                        />
                    </MapContainer>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>

                {status.message && (
                    <div className={`status-message ${status.type}`}>
                        {status.message}
                    </div>
                )}
            </form>
        </div>
    );
}

export default Report;