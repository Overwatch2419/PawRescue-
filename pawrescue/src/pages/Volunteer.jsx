import { useState, useEffect } from "react";
import { subscribeToRescues, updateRescueStatus } from "../services/rescueService";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

function Volunteer() {
    const { volunteer } = useAuth();
    const [rescues, setRescues] = useState([]);
    const [viewTab, setViewTab] = useState("available"); // 'available' or 'mine'
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToRescues((data) => {
            setRescues(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        setUpdating(id);
        try {
            const updatedRescue = await updateRescueStatus(id, newStatus);
            setRescues((prev) =>
                prev.map((r) => (r._id === id ? updatedRescue : r))
            );
        } catch (error) {
            alert("Failed to update status: " + error.message);
        } finally {
            setUpdating(null);
        }
    };

    const navigateToLocation = (lat, lng) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    };

    // Ensure ID is extracted even if localStorage is outdated
    const volId = volunteer?.id || (volunteer?.token ? JSON.parse(atob(volunteer.token.split('.')[1]))?.id : null);

    // Separate rescues into Available (pending) and Mine (assigned to me)
    const availableRescues = rescues.filter((r) => r.status === "pending");
    const myRescues = rescues.filter((r) => r.assignedTo === volId);

    // Filter the currently active tab
    const activeList = viewTab === "available" ? availableRescues : myRescues;
    
    // Apply status filter
    const filteredRescues = activeList.filter((r) => {
        if (filter === "all") return true;
        return r.status === filter;
    });

    const MY_FILTERS = ["all", "accepted", "on_way", "in_progress", "rescued"];

    const getStatusLabel = (status) => {
        const map = {
            pending: "🔴 New",
            accepted: "🔵 Accepted",
            on_way: "🟡 On the Way",
            in_progress: "🟠 In Progress",
            rescued: "🟢 Resolved",
            archived: "⚫ Archived",
        };
        return map[status] || status;
    };

    const getUrgencyClass = (urgency) => {
        switch (urgency) {
            case "Critical": return "urgency-critical";
            case "Serious": return "urgency-serious";
            case "Stable": return "urgency-stable";
            default: return "";
        }
    };

    const counts = activeList.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="volunteer-dashboard">
            {/* Header & Main Tabs */}
            <header className="dashboard-header" style={{ marginBottom: "1rem" }}>
                <div>
                    <h2>Volunteer Dashboard 🛡️</h2>
                    <p style={{ color: "#888", margin: "8px 0 0 0" }}>
                        {availableRescues.length} available to claim &nbsp;·&nbsp;
                        {myRescues.length} assigned to you
                    </p>
                </div>
                
                <div className="main-tabs" style={{ display: "flex", gap: "10px" }}>
                    <Button 
                        variant={viewTab === "available" ? "primary" : "secondary"}
                        onClick={() => { setViewTab("available"); setFilter("all"); }}
                    >
                        🌍 Available Rescues ({availableRescues.length})
                    </Button>
                    <Button 
                        variant={viewTab === "mine" ? "primary" : "secondary"}
                        onClick={() => { setViewTab("mine"); setFilter("all"); }}
                    >
                        👤 My active tasks ({myRescues.length})
                    </Button>
                </div>
            </header>

            {/* Sub-filters (Only show on "My tasks" tab since Available is just pending) */}
            {viewTab === "mine" && myRescues.length > 0 && (
                <div className="filter-bar" style={{ marginBottom: "2rem", display: "inline-flex" }}>
                    {MY_FILTERS.map((f) => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === "all" ? "All My Tasks" : f.replace("_", " ")}
                            {counts[f] ? ` (${counts[f]})` : ""}
                        </button>
                    ))}
                </div>
            )}
            
            {viewTab === "available" && <div style={{ marginBottom: "2rem" }}></div>}

            {/* Card Grid */}
            {loading ? (
                <div className="dashboard-loading">Loading rescue reports... 🔄</div>
            ) : filteredRescues.length === 0 ? (
                <div className="no-reports">
                    {viewTab === "available" 
                        ? "No new rescues right now! Excellent job team. 🎉" 
                        : "You don't have any active rescues. Check the 'Available Rescues' tab!"}
                </div>
            ) : (
                <div className="rescue-grid">
                    {filteredRescues.map((rescue) => {
                        const isUpdating = updating === rescue._id;
                        return (
                            <div key={rescue._id} className={`rescue-card status-${rescue.status}`}>
                                {/* Card Header */}
                                <div className="card-top">
                                    <span className={`animal-badge ${rescue.animalType?.toLowerCase()}`}>
                                        {rescue.animalType}
                                    </span>
                                    <span className="status-indicator">{getStatusLabel(rescue.status)}</span>
                                    <span className={`urgency-badge ${getUrgencyClass(rescue.urgency)}`}>
                                        {rescue.urgency}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className="card-body">
                                    <p className="description">{rescue.description}</p>
                                    <div className="location-detail">
                                        <strong>📍</strong> {rescue.address || "Map coordinates only"}
                                    </div>
                                    <div className="contact-detail">
                                        <strong>📞</strong> {rescue.contactInfo}
                                    </div>
                                    <div className="time">
                                        🕒 {new Date(rescue.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="card-footer">
                                    <div className="actions-workflow">
                                        {/* PENDING → Accept or Archive */}
                                        {rescue.status === "pending" && (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    disabled={isUpdating}
                                                    onClick={() => handleStatusChange(rescue._id, "accepted")}
                                                >
                                                    ✅ Accept Rescue
                                                </Button>
                                            </>
                                        )}

                                        {/* ACCEPTED → Start or Decline */}
                                        {rescue.status === "accepted" && (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    disabled={isUpdating}
                                                    onClick={() => handleStatusChange(rescue._id, "on_way")}
                                                >
                                                    🚗 Start Rescue
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    disabled={isUpdating}
                                                    onClick={() => handleStatusChange(rescue._id, "pending")}
                                                >
                                                    ↩ Cancel
                                                </Button>
                                            </>
                                        )}

                                        {/* ON_WAY → Navigate + In Progress */}
                                        {rescue.status === "on_way" && (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => navigateToLocation(rescue.location.lat, rescue.location.lng)}
                                                >
                                                    🧭 Navigate
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    disabled={isUpdating}
                                                    onClick={() => handleStatusChange(rescue._id, "in_progress")}
                                                >
                                                    🐾 Mark In Progress
                                                </Button>
                                            </>
                                        )}

                                        {/* IN PROGRESS → Resolve */}
                                        {rescue.status === "in_progress" && (
                                            <Button
                                                variant="primary"
                                                disabled={isUpdating}
                                                onClick={() => handleStatusChange(rescue._id, "rescued")}
                                            >
                                                🎉 Mark as Resolved
                                            </Button>
                                        )}

                                        {/* RESCUED → Reopen option */}
                                        {rescue.status === "rescued" && (
                                            <>
                                                <span className="resolved-text">Successfully Rescued 🎉</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Volunteer;