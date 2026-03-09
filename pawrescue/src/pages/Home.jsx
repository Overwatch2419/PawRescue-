import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import { subscribeToRescues } from "../services/rescueService";

function Home() {
    const [rescues, setRescues] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribeToRescues((data) => {
            console.log("Fetched rescues from MongoDB:", data);
            setRescues(data);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="home-content">
            <header className="home-header">
                <h2>Active Rescue Missions 🐾</h2>
                <p>Tracking injured animals in real-time. Coordinate with teams for rescue ops.</p>
            </header>
            
            <div className="map-wrapper">
                <MapView rescues={rescues} />
            </div>
        </div>
    );
}

export default Home;