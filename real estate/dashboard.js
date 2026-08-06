import { apiFetch, escapeHtml } from "./js/api.js";
import { requireAuth, wireLogout } from "./auth-guard.js";

function statusActionButtons(property) {
    const soldOrRentedLabel = property.listingType === "rent" ? "Rented" : "Sold";

    if (property.status === "available") {
        return `<button class="btn btn-ghost btn-sm" data-mark-status="${property._id}" data-status="${property.listingType === "rent" ? "rented" : "sold"}">Mark as ${soldOrRentedLabel}</button>`;
    }
    if (property.status === "sold" || property.status === "rented") {
        return `<button class="btn btn-ghost btn-sm" data-mark-status="${property._id}" data-status="available">Mark as Available</button>`;
    }
    return "";
}

function propertyCard(property, options = {}) {
    const priceLabel = `$${Number(property.price).toLocaleString()}${property.listingType === "rent" ? "/mo" : ""}`;
    const statusPill = property.status
        ? `<span class="pill pill-${property.status === "available" ? "available" : property.status === "pending" ? "pending" : property.status === "rejected" ? "rejected" : "sold"}"><span class="pill-dot"></span>${escapeHtml(property.status)}</span>`
        : "";

    return `
        <div class="card listing-item">
            ${property.imageUrls?.[0] ? `<img src="${property.imageUrls[0]}" alt="${escapeHtml(property.title)}">` : `<div class="property-noimg"></div>`}
            <div class="body">
                <div class="price">${priceLabel}</div>
                <a href="property-details.html?id=${property._id}" class="title">${escapeHtml(property.title)}</a>
                <div class="loc">${escapeHtml(property.location)}</div>
                ${statusPill ? `<div style="margin-top:6px">${statusPill}</div>` : ""}
                <div class="listing-actions">
                    ${options.removable ? `<button class="btn btn-ghost btn-sm" data-remove-favorite="${property._id}">Remove</button>` : ""}
                    ${options.statusActions ? statusActionButtons(property) : ""}
                    ${options.deletable ? `<button class="btn btn-danger btn-sm" data-delete-listing="${property._id}">Delete</button>` : ""}
                </div>
            </div>
        </div>
    `;
}

function switchView(view) {
    document.querySelectorAll(".app-sidebar .item[data-view]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.view === view);
    });
    document.querySelectorAll("[data-view-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.viewPanel !== view;
    });
}

async function loadSaved() {
    const grid = document.getElementById("saved-grid");
    try {
        const { favorites } = await apiFetch("favorites");
        document.getElementById("stat-saved").textContent = favorites.length;
        grid.innerHTML = favorites.length
            ? favorites.map((p) => propertyCard(p, { removable: true })).join("")
            : "<p>You haven't saved any properties yet.</p>";
    } catch (error) {
        grid.innerHTML = "<p>Could not load saved properties.</p>";
    }
}

async function loadMyListings() {
    const listingsGrid = document.getElementById("my-listings-grid");
    const overviewGrid = document.getElementById("overview-listings");
    try {
        const { properties } = await apiFetch("properties/mine");
        document.getElementById("stat-listings").textContent = properties.length;
        document.getElementById("stat-pending").textContent = properties.filter(p => p.status === "pending").length;

        const html = properties.length
            ? properties.map((p) => propertyCard(p, { deletable: true, statusActions: true })).join("")
            : `<p>You haven't listed any properties yet. <a href="sell.html">List one now</a>.</p>`;
        listingsGrid.innerHTML = html;
        overviewGrid.innerHTML = properties.length
            ? properties.slice(0, 3).map((p) => propertyCard(p, { deletable: true, statusActions: true })).join("")
            : `<p>You haven't listed any properties yet. <a href="sell.html">List one now</a>.</p>`;
    } catch (error) {
        listingsGrid.innerHTML = "<p>Could not load your listings.</p>";
        overviewGrid.innerHTML = "<p>Could not load your listings.</p>";
    }
}

async function loadMessages() {
    const container = document.getElementById("messages-list");
    try {
        const { inquiries } = await apiFetch("inquiries/mine");
        container.innerHTML = inquiries.length
            ? inquiries.map((inquiry) => `
                <div class="card message-item">
                    <div class="message-header">
                        <a href="property-details.html?id=${inquiry.propertyId?._id || ""}">${escapeHtml(inquiry.propertyId?.title || "Listing removed")}</a>
                        <span class="message-date">${new Date(inquiry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="message-from"><strong>${escapeHtml(inquiry.name)}</strong> &lt;${escapeHtml(inquiry.email)}&gt;${inquiry.phone ? ` &middot; ${escapeHtml(inquiry.phone)}` : ""}</p>
                    <p>${escapeHtml(inquiry.message)}</p>
                </div>
            `).join("")
            : "<p>No messages yet.</p>";
    } catch (error) {
        container.innerHTML = "<p>Could not load messages.</p>";
    }
}

function requestStatusPill(status) {
    const kind = status === "accepted" ? "available" : status === "declined" || status === "cancelled" ? "rejected" : "pending";
    return `<span class="pill pill-${kind}"><span class="pill-dot"></span>${escapeHtml(status)}</span>`;
}

async function loadIncomingRequests() {
    const container = document.getElementById("incoming-requests-list");
    try {
        const { requests } = await apiFetch("requests/mine-incoming");
        container.innerHTML = requests.length
            ? requests.map((r) => `
                <div class="card message-item">
                    <div class="message-header">
                        <a href="property-details.html?id=${r.propertyId?._id || ""}">${escapeHtml(r.propertyId?.title || "Listing removed")} &mdash; ${r.requestType === "rent" ? "Rent" : "Buy"} request</a>
                        <span class="message-date">${new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="message-from">${escapeHtml(r.buyerId?.firstName || "")} ${escapeHtml(r.buyerId?.lastName || "")} &lt;${escapeHtml(r.buyerId?.email || "")}&gt;${r.buyerId?.phone ? ` &middot; ${escapeHtml(r.buyerId.phone)}` : ""}</p>
                    <div style="margin-top:8px; display:flex; align-items:center; gap:8px">
                        ${requestStatusPill(r.status)}
                        ${r.status === "pending" ? `
                            <button class="btn btn-primary btn-sm" data-accept-request="${r._id}">Accept</button>
                            <button class="btn btn-danger btn-sm" data-decline-request="${r._id}">Decline</button>
                        ` : ""}
                    </div>
                </div>
            `).join("")
            : "<p>No requests received yet.</p>";
    } catch (error) {
        container.innerHTML = "<p>Could not load requests.</p>";
    }
}

async function loadOutgoingRequests() {
    const container = document.getElementById("outgoing-requests-list");
    try {
        const { requests } = await apiFetch("requests/mine-outgoing");
        container.innerHTML = requests.length
            ? requests.map((r) => `
                <div class="card message-item">
                    <div class="message-header">
                        <a href="property-details.html?id=${r.propertyId?._id || ""}">${escapeHtml(r.propertyId?.title || "Listing removed")} &mdash; ${r.requestType === "rent" ? "Rent" : "Buy"} request</a>
                        <span class="message-date">${new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style="margin-top:8px">${requestStatusPill(r.status)}</div>
                </div>
            `).join("")
            : "<p>You haven't requested any properties yet.</p>";
    } catch (error) {
        container.innerHTML = "<p>Could not load your requests.</p>";
    }
}

async function handleRequestsClick(event) {
    const acceptBtn = event.target.closest("[data-accept-request]");
    if (acceptBtn) {
        if (!confirm("Accept this request? The property will be marked sold/rented and any other pending requests on it will be declined.")) return;
        await apiFetch(`requests/${acceptBtn.dataset.acceptRequest}/accept`, { method: "PATCH" });
        loadIncomingRequests();
        loadMyListings();
        return;
    }
    const declineBtn = event.target.closest("[data-decline-request]");
    if (declineBtn) {
        await apiFetch(`requests/${declineBtn.dataset.declineRequest}/decline`, { method: "PATCH" });
        loadIncomingRequests();
    }
}

async function handleGridClick(event) {
    const removeBtn = event.target.closest("[data-remove-favorite]");
    if (removeBtn) {
        await apiFetch(`favorites/${removeBtn.dataset.removeFavorite}`, { method: "DELETE" });
        loadSaved();
        return;
    }
    const deleteBtn = event.target.closest("[data-delete-listing]");
    if (deleteBtn) {
        if (!confirm("Delete this listing?")) return;
        await apiFetch(`properties/${deleteBtn.dataset.deleteListing}`, { method: "DELETE" });
        loadMyListings();
        return;
    }
    const statusBtn = event.target.closest("[data-mark-status]");
    if (statusBtn) {
        await apiFetch(`properties/${statusBtn.dataset.markStatus}/status`, {
            method: "PATCH",
            body: { status: statusBtn.dataset.status },
        });
        loadMyListings();
    }
}

function setupProfileForm(user) {
    document.getElementById("profile-first-name").value = user.firstName;
    document.getElementById("profile-last-name").value = user.lastName;
    document.getElementById("profile-phone").value = user.phone || "";
    document.getElementById("profile-email").value = user.email;

    document.getElementById("profile-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const status = document.getElementById("profile-status");
        try {
            await apiFetch("auth/me", {
                method: "PATCH",
                body: {
                    firstName: document.getElementById("profile-first-name").value,
                    lastName: document.getElementById("profile-last-name").value,
                    phone: document.getElementById("profile-phone").value,
                },
            });
            status.textContent = "Saved!";
            status.style.color = "var(--accent)";
        } catch (error) {
            status.textContent = "Failed to save: " + error.message;
            status.style.color = "var(--danger)";
        }
    });
}

async function init() {
    const user = await requireAuth();
    if (!user) return;

    document.getElementById("welcome-message").textContent = `Welcome back, ${user.firstName}.`;
    wireLogout();
    setupProfileForm(user);

    document.querySelectorAll(".app-sidebar .item[data-view]").forEach((btn) => {
        btn.addEventListener("click", () => switchView(btn.dataset.view));
    });
    document.querySelectorAll(".listing-grid").forEach((grid) => grid.addEventListener("click", handleGridClick));
    document.getElementById("incoming-requests-list").addEventListener("click", handleRequestsClick);

    await Promise.all([loadSaved(), loadMyListings(), loadMessages(), loadIncomingRequests(), loadOutgoingRequests()]);
    if (window.lucide) window.lucide.createIcons();
}

init();
