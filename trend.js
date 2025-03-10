
// Global variables for charts and device details
let chartInstance = null;       // For the trend bar chart
let pieChartInstance = null;      // For the pie chart (device details)
let currentFilteredDevices = [];  // Stores filtered devices (from trend data)
let currentDeviceIndex = 0;    // Index of the device being shown in the pie modal
let devicesData = []; // Store all devices globally
let pieChart; // Store the Pie Chart instance


// ---------------- Trend Bar Chart Functions ----------------

// On page load, default to APAC region and "cameras"
document.addEventListener("DOMContentLoaded", function () {
    fetchTrendData('apac', 'cameras');
});

// Fetch and display the trend bar chart for the selected region and device type
function fetchTrendData(region, deviceType = 'cameras') {
    console.log(`Fetching data for region: ${region}, device type: ${deviceType}`);
    fetch(`http://localhost:80/api/regions/trend/details/${region}`)
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);
            if (data && data.devices && data.devices.length > 0) {
                const filteredDevices = filterDevicesByType(data.devices, deviceType);
                console.log("Filtered Devices:", filteredDevices);
                currentFilteredDevices = filteredDevices; // Save globally for pie chart details
                displayTrendChart(filteredDevices);
                updateDeviceDropdown(filteredDevices); // Update the device selection dropdown
            } else {
                console.error("No devices data available.");
                alert("No devices found for the selected region and device type.");
            }
        })
        .catch(error => {
            console.error("Error fetching trend data:", error);
            alert("Error fetching trend data");
        });
}

// Filter devices based on the selected device type
function filterDevicesByType(devices, deviceType) {
    return devices.filter(device => device.type.toLowerCase().trim() === deviceType.toLowerCase());
}

// Create or update the trend bar chart using Chart.js
function displayTrendChart(devices) {
    if (chartInstance) {
        chartInstance.destroy();
    }
    const labels = devices.map(device => device.ip);
    const uptimeData = devices.map(device => convertToMinutes(device.daily.uptime));
    const downtimeData = devices.map(device => convertToMinutes(device.daily.downtimeDuration));
    const ctx = document.getElementById("trendChart").getContext("2d");

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                { label: "Uptime (minutes)", data: uptimeData, backgroundColor: "green" },
                { label: "Downtime (minutes)", data: downtimeData, backgroundColor: "red" }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Utility: Convert "Xd Xh Xm Xs" format to minutes
function convertToMinutes(timeString) {
    const parts = timeString.split(" ");
    let totalMinutes = 0;
    parts.forEach(part => {
        if (part.includes("d")) totalMinutes += parseInt(part) * 1440;
        if (part.includes("h")) totalMinutes += parseInt(part) * 60;
        if (part.includes("m")) totalMinutes += parseInt(part);
    });
    return totalHours,totalMinutes,totalSeconds;
}


// ---------------- Pie Chart Modal Functions ----------------

// Open Pie Chart Modal
function openPieChartModal() {
    if (currentFilteredDevices.length === 0) {
        alert("No devices available for pie chart details.");
        return;
    }
    currentDeviceIndex = 0; 
    updatePieChartForCurrentDevice();
    document.getElementById("pieChartModal").style.display = "block";
}

// Close Pie Chart Modal
function closePieChartModal() {
    document.getElementById("pieChartModal").style.display = "none";
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }
}

// Update Pie Chart for the Selected Device
function updatePieChartForCurrentDevice() {
    let selectedDeviceIP = document.getElementById("deviceDropdown").value;
    let period = document.getElementById("piePeriod").value;
    let device = currentFilteredDevices.find(d => d.ip === selectedDeviceIP);
    
    if (!device) return;
    
    let dataPeriod = device[period];
    let uptime = convertToMinutes(dataPeriod.uptime);
    let downtime = convertToMinutes(dataPeriod.downtimeDuration);

    let offlineCount = device.weekly.offlineCount || 0;
    let downtimeMins = convertToMinutes(device.weekly.downtimeDuration);

    if (period === "weekly" && offlineCount > 5 && downtimeMins > 60) {
        document.getElementById("deviceAlert").textContent = "Need to repair";
    } else {
        document.getElementById("deviceAlert").textContent = "Device working properly";
    }

    document.getElementById("deviceInfo").textContent = "Device: " + device.ip;

    const ctx = document.getElementById("pieChartCanvas").getContext("2d");
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }
    pieChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Uptime (mins)", "Downtime (mins)"],
            datasets: [{ data: [uptime, downtime], backgroundColor: ["green", "red"] }]
        }
    });
}

// Populate Device Dropdown
function updateDeviceDropdown(devices) {
    let dropdown = document.getElementById("deviceDropdown");
    dropdown.innerHTML = "";
    devices.forEach(device => {
        let option = document.createElement("option");
        option.value = device.ip;
        option.textContent = device.ip;
        dropdown.appendChild(option);
    });
}

// Search Device
function searchDevice() {
    let searchQuery = document.getElementById("searchBox").value.toLowerCase();
    let dropdown = document.getElementById("deviceDropdown");
    for (let option of dropdown.options) {
        option.style.display = option.value.includes(searchQuery) ? "block" : "none";
    }
}

// Event Listeners
document.getElementById("piePeriod").addEventListener("change", updatePieChartForCurrentDevice);
document.getElementById("searchBox").addEventListener("input", searchDevice);



// Create or update the trend bar chart using Chart.js
function displayTrendChart(devices) {
    if (chartInstance) {
        chartInstance.destroy();
    }
    const labels = devices.map(device => device.ip);
    const uptimeData = devices.map(device => convertToMinutes(device.daily.uptime));
    const downtimeData = devices.map(device => convertToMinutes(device.daily.downtimeDuration));
    const ctx = document.getElementById("trendChart").getContext("2d");
    
    // Create gradients for better visual effect
    let gradientUptime = ctx.createLinearGradient(0, 0, 0, 400);
    gradientUptime.addColorStop(0, "rgb(75, 192, 89)");
    gradientUptime.addColorStop(1, "rgba(59, 190, 83, 0.95)");
    
    let gradientDowntime = ctx.createLinearGradient(0, 0, 0, 400);
    gradientDowntime.addColorStop(0, "rgb(244, 29, 29)");
    gradientDowntime.addColorStop(1, "rgba(235, 20, 20, 0.9)");
    
    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Uptime (minutes)",
                    data: uptimeData,
                    backgroundColor: gradientUptime,
                    borderColor: "rgb(23, 179, 33)",
                    borderWidth: 2,
                    hoverBackgroundColor: "rgba(63, 193, 100, 0.85)"
                },
                {
                    label: "Downtime (minutes)",
                    data: downtimeData,
                    backgroundColor: gradientDowntime,
                    borderColor: "rgb(226, 39, 43)",
                    borderWidth: 2,
                    hoverBackgroundColor: "rgba(219, 29, 29, 0.9)"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: "easeInOutQuart"
            },
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(233, 40, 40, 0.74)",
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ": " + context.parsed.y + " mins";
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { font: { size: 12 } },
                    grid: { display: false },
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                },
                y: {
                    beginAtZero: true,
                    ticks: { font: { size: 12 } },
                    grid: { color: "rgba(200, 200, 200, 0.2)" }
                }
            }
        }
    });
}

// Utility: Convert a time string in "Xd Xh Xm Xs" format to minutes
// Convert "Xd Xh Xm Xs" format to minutes
function convertToMinutes(timeString) {
    const parts = timeString.split(" ");
    let totalMinutes = 0;
    parts.forEach(part => {
        if (part.includes("d")) totalMinutes += parseInt(part) * 1440;
        if (part.includes("h")) totalMinutes += parseInt(part) * 60;
        if (part.includes("m")) totalMinutes += parseInt(part);
        if (part.includes("s")) totalMinutes += parseInt(part) / 60; // Convert seconds to minutes
    });
    return totalMinutes;
}

// Convert minutes back to "Xh Xm Xs" format
function convertToReadableFormat(minutes) {
    let hours = Math.floor(minutes / 60);
    let remainingMinutes = Math.floor(minutes % 60);
    let seconds = Math.round((minutes % 1) * 60); // Convert fraction of minutes to seconds

    let formattedTime = "";
    if (hours > 0) formattedTime += hours + "h ";
    if (remainingMinutes > 0) formattedTime += remainingMinutes + "m ";
    if (seconds > 0) formattedTime += seconds + "s";

    return formattedTime.trim();
}

// ---------------- Event Listeners for Region & Device Type ----------------

// Region buttons event listener
document.querySelectorAll('.region-selector button').forEach(button => {
    button.addEventListener('click', function () {
        const region = button.textContent.toLowerCase().trim();
        const deviceType = document.getElementById('deviceType').value;
        fetchTrendData(region, deviceType);
        // Highlight active region button
        document.querySelectorAll('.region-selector button').forEach(btn => btn.style.backgroundColor = 'gray');
        button.style.backgroundColor = '#555';
    });
});

// Device type dropdown change event
document.getElementById('deviceType').addEventListener('change', function() {
    const deviceType = this.value;
    let selectedRegion = 'apac'; // Default region
    document.querySelectorAll('.region-selector button').forEach(button => {
        if (button.style.backgroundColor === 'rgb(85, 85, 85)' || button.style.backgroundColor === '#555') {
            selectedRegion = button.textContent.toLowerCase().trim();
        }
    });
    fetchTrendData(selectedRegion, deviceType);
});

// ---------------- Pie Chart Modal Functions (Device Details) ----------------

// Call this function when user clicks the "Show Device Details" button
function openPieChartModal() {
    if (currentFilteredDevices.length === 0) {
        alert("No devices available for pie chart details.");
        return;
    }
    currentDeviceIndex = 0; // Start with first device
    updatePieChartForCurrentDevice();
    document.getElementById("pieChartModal").style.display = "block";
}

// Close the pie chart modal
function closePieChartModal() {
    document.getElementById("pieChartModal").style.display = "none";
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }
}

// Update (or create) the pie chart for the current device based on the selected period
function updatePieChartForCurrentDevice() {
    // Get selected period from dropdown ("daily", "weekly", "monthly")
    let period = document.getElementById("piePeriod").value;
    let device = currentFilteredDevices[currentDeviceIndex];
    let dataPeriod = device[period];
    let uptime = convertToMinutes(dataPeriod.uptime);
    let downtime = convertToMinutes(dataPeriod.downtimeDuration);
    
    // For weekly period, check the repair condition (simulate offline count)
    if (period === "weekly") {
        // If your API supplies an offline count, use it; otherwise default to 0.
        let offlineCount = device.weekly.offlineCount || 0;
        let downtimeMins = convertToMinutes(device.weekly.downtimeDuration);
        if (offlineCount > 5 && downtimeMins > 60) {
            document.getElementById("deviceAlert").textContent = "Need to repair";
        } else {
            document.getElementById("deviceAlert").textContent = "Device working properly";
        }
    } else {
        document.getElementById("deviceAlert").textContent = "";
    }
    
    // Show device info (for example, its IP)
    document.getElementById("deviceInfo").textContent = "Device: " + device.ip;
    
    // Create/update the pie chart
    const ctx = document.getElementById("pieChartCanvas").getContext("2d");
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }
    pieChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Uptime (mins)", "Downtime (mins)"],
            datasets: [{
                data: [uptime, downtime],
                backgroundColor: ["rgba(48, 210, 91, 0.98)", "rgba(224, 51, 51, 0.98)"],
                borderColor: ["rgba(47, 190, 102, 0.14)", "rgb(233, 23, 23)"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || "";
                            let value = context.parsed;
                            return label + ": " + value + " mins";
                        }
                    }
                }
            }
        }
    });
}

// Functions to cycle through devices in the pie chart modal
function nextDevice() {
    if (currentDeviceIndex < currentFilteredDevices.length - 1) {
        currentDeviceIndex++;
        updatePieChartForCurrentDevice();
    }
}

function previousDevice() {
    if (currentDeviceIndex > 0) {
        currentDeviceIndex--;
        updatePieChartForCurrentDevice();
    }
}

// Event listener for the period dropdown inside the pie modal
document.getElementById("piePeriod").addEventListener("change", updatePieChartForCurrentDevice);
