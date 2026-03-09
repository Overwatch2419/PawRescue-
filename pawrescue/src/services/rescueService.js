const API_URL = 'http://localhost:5000/api/rescues';

/**
 * Adds a new rescue report to MongoDB via the backend API.
 * @param {Object} reportData - The detailed report data.
 */
export const addReport = async (reportData) => {
    console.log("Attempting to add report to MongoDB:", reportData);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add report');
        }

        const data = await response.json();
        console.log("Report added to MongoDB successfully! ID:", data._id);
        return data._id;
    } catch (error) {
        console.error("Error adding report to MongoDB: ", error);
        throw error;
    }
};

/**
 * Fetches all rescues from the MongoDB backend.
 */
export const fetchRescues = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch rescues');
        return await response.json();
    } catch (error) {
        console.error("Error fetching rescues:", error);
        throw error;
    }
};

/**
 * Helper to maintain real-time-like updates via polling for now.
 * @param {Function} callback - Function to handle the updated list of rescues.
 */
export const subscribeToRescues = (callback) => {
    // Initial fetch
    fetchRescues().then(callback);

    // Set up polling (every 10 seconds)
    const interval = setInterval(async () => {
        try {
            const data = await fetchRescues();
            callback(data);
        } catch (error) {
            console.error("Polling error:", error);
        }
    }, 10000);

    return () => clearInterval(interval);
};

/**
 * Updates the status of a rescue report.
 * @param {string} id - The ID of the rescue.
 * @param {string} status - The new status ('pending', 'rescued', 'archived').
 */
export const updateRescueStatus = async (id, status) => {
    const saved = localStorage.getItem("pawrescue_volunteer");
    const token = saved ? JSON.parse(saved).token : null;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) throw new Error('Failed to update status');
        return await response.json();
    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
};
