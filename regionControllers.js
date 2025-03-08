
const { fetchGlobalData, fetchRegionData, fetchRegionTrendData } = require("../services/excelService");


// Controller for fetch trend data
// Controller for fetch trend data
const getRegionTrendDetails = async (req, res) => {
    try {
        const { region } = req.params;
        console.log("Requested Region:", region);

        if (!region) {
            return res.status(400).json({ error: "Region parameter is missing" });
        }

        const trendData = await fetchRegionTrendData(region);
        console.log("Trend Data Response:", JSON.stringify(trendData, null, 2));

        if (!trendData || typeof trendData !== "object") {
            return res.status(500).json({ error: "Failed to fetch trend data" });
        }

        res.json({
            region,
            trends: trendData
        });
    } catch (error) {
        console.error("Error in getRegionTrendDetails:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

// Region Trend Summary Controller (for uptime/downtime trends)
const getRegionTrendSummary = async (req, res) => {
    try {
        const { region } = req.params;
        console.log("Fetching trend summary for region:", region);
        const trendData = await fetchRegionTrendData(region);

        if (!trendData) {
            return res.status(500).json({ error: "Failed to fetch trend data for region" });
        }

        res.json({ region, trendData });
    } catch (error) {
        console.error("Error in getRegionTrendSummary:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};



// Global Summary Controller
const getGlobalSummary = async (req, res) => {
    try {
        const globalData = await fetchGlobalData();
        res.status(200).json({ summary: globalData.summary });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

// Global Details Controller
const getGlobalDetails = async (req, res) => {
    try {
        const globalData = await fetchGlobalData();
        res.status(200).json({ details: globalData.details });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

// Region Summary Controller
const getRegionSummary = async (req, res) => {
    const { regionName } = req.params;
    try {
        const regionData = await fetchRegionData(regionName);
        res.status(200).json({ summary: regionData.summary });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

// Region Details Controller
const getRegionDetails = async (req, res) => {
    const { regionName } = req.params;
    try {
        const regionData = await fetchRegionData(regionName);
        res.status(200).json({ details: regionData.details });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

module.exports = {
    getGlobalSummary,
    getGlobalDetails,
    getRegionSummary,
    getRegionDetails,
    getRegionTrendDetails,
    getRegionTrendSummary,
};

