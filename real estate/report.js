import { apiFetch, escapeHtml } from "./js/api.js";
import { requireAuth } from "./auth-guard.js";

await requireAuth({ roles: ["admin"] });

Chart.defaults.font.family = "Inter, sans-serif";
Chart.defaults.color = "#6B7280";
Chart.defaults.plugins.tooltip.backgroundColor = "#0F172A";
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.titleFont = { family: "Inter, sans-serif", weight: "600" };
Chart.defaults.plugins.tooltip.bodyFont = { family: "Inter, sans-serif" };

function doughnut(canvasId, labels, data, colors) {
    new Chart(document.getElementById(canvasId).getContext("2d"), {
        type: "doughnut",
        data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 3, borderColor: "#fff", hoverOffset: 6 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: { legend: { position: "bottom", labels: { boxWidth: 10, padding: 14, font: { size: 12 } } } },
        },
    });
}

async function loadReports() {
    const data = await apiFetch("admin/reports");
    const { totals, statusBreakdown, listingTypeBreakdown, propertyTypeBreakdown, user_activity } = data;

    document.getElementById("stat-users").textContent = totals.users;
    document.getElementById("stat-listings").textContent = totals.listings;
    document.getElementById("stat-available").textContent = totals.available;
    document.getElementById("stat-sold").textContent = totals.sold;
    document.getElementById("stat-rented").textContent = totals.rented;
    document.getElementById("stat-inquiries").textContent = totals.inquiries;

    // User signups over time
    new Chart(document.getElementById("userActivityChart").getContext("2d"), {
        type: "line",
        data: {
            labels: user_activity.map(item => item.login_date),
            datasets: [{
                label: "New Users",
                data: user_activity.map(item => item.total_users),
                borderColor: "#006AFF",
                backgroundColor: "rgba(0,106,255,0.1)",
                borderWidth: 2.5,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: "#006AFF",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#F1F5F9" } },
                x: { grid: { display: false } },
            },
        },
    });

    // Listings by status
    doughnut(
        "statusChart",
        ["Pending", "Available", "Sold", "Rented", "Rejected"],
        [statusBreakdown.pending, statusBreakdown.available, statusBreakdown.sold, statusBreakdown.rented, statusBreakdown.rejected],
        ["#F59E0B", "#22C55E", "#E11D48", "#7C3AED", "#94A3B8"]
    );

    // Sale vs rent
    doughnut(
        "listingTypeChart",
        ["For Sale", "For Rent"],
        [listingTypeBreakdown.sale, listingTypeBreakdown.rent],
        ["#006AFF", "#0D9488"]
    );

    // Property type breakdown
    new Chart(document.getElementById("propertyTypeChart").getContext("2d"), {
        type: "bar",
        data: {
            labels: ["Apartment", "House", "Condo"],
            datasets: [{
                data: [propertyTypeBreakdown.apartment, propertyTypeBreakdown.house, propertyTypeBreakdown.condo],
                backgroundColor: ["#006AFF", "#7C3AED", "#0D9488"],
                borderRadius: 6,
                maxBarThickness: 56,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#F1F5F9" } },
                x: { grid: { display: false } },
            },
        },
    });

    // Buy/rent requests
    doughnut(
        "requestsChart",
        ["Pending", "Accepted", "Declined"],
        [totals.requestsPending, totals.requestsAccepted, totals.requestsDeclined],
        ["#F59E0B", "#22C55E", "#E11D48"]
    );

    // Property sales table
    document.getElementById("propertyTable").innerHTML = data.properties.map((property) => `
        <tr>
            <td>${escapeHtml(property.title)}</td>
            <td class="tabular">$${Number(property.price).toLocaleString()}</td>
            <td><span class="pill pill-${property.status === "available" ? "available" : property.status === "pending" ? "pending" : property.status === "rejected" ? "rejected" : "sold"}"><span class="pill-dot"></span>${escapeHtml(property.status)}</span></td>
            <td>${property.sold_date ? new Date(property.sold_date).toLocaleDateString() : "N/A"}</td>
        </tr>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
}

loadReports();
