import { apiFetch, escapeHtml } from "./js/api.js";
import { requireAuth, wireLogout } from "./auth-guard.js";

function statusPill(status) {
    const kind = status === "available" ? "available" : status === "pending" ? "pending" : status === "rejected" ? "rejected" : "sold";
    return `<span class="pill pill-${kind}"><span class="pill-dot"></span>${escapeHtml(status)}</span>`;
}

function switchView(view) {
    document.querySelectorAll(".app-sidebar .item[data-view]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.view === view);
    });
    document.querySelectorAll("[data-view-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.viewPanel !== view;
    });
}

async function renderPending() {
    const container = document.getElementById("pending-listings");
    const { properties } = await apiFetch("properties/pending");

    if (properties.length === 0) {
        container.innerHTML = "<p>No pending listings.</p>";
        return;
    }

    container.innerHTML = `<div class="admin-pending-grid">${properties.map((listing) => `
        <div class="card">
            ${listing.imageUrls?.[0] ? `<img src="${listing.imageUrls[0]}" alt="Property" style="width:100%;height:140px;object-fit:cover;border-radius:var(--radius) var(--radius) 0 0">` : ""}
            <div class="body" style="padding:16px">
                <h3>${escapeHtml(listing.title)}</h3>
                <p style="margin:0 0 4px">${escapeHtml(listing.location)}</p>
                <p class="price" style="font-weight:700;color:var(--text);margin-bottom:8px">$${Number(listing.price).toLocaleString()}</p>
                <p style="font-size:13px">${escapeHtml(listing.description || "")}</p>
                <div class="property-buttons" style="display:flex;gap:8px;margin-top:10px">
                    <button class="btn btn-primary btn-sm" data-action="approve" data-id="${listing._id}">Approve</button>
                    <button class="btn btn-danger btn-sm" data-action="reject" data-id="${listing._id}">Reject</button>
                </div>
            </div>
        </div>
    `).join("")}</div>`;
}

async function renderAllProperties() {
    const tbody = document.querySelector("#all-properties-table tbody");
    const { properties } = await apiFetch("admin/properties");

    tbody.innerHTML = properties.length
        ? properties.map((p) => `
            <tr>
                <td>${escapeHtml(p.title)}</td>
                <td>${escapeHtml(p.propertyType)}</td>
                <td class="tabular">$${Number(p.price).toLocaleString()}</td>
                <td>${statusPill(p.status)}</td>
            </tr>
        `).join("")
        : `<tr><td colspan="4">No properties yet.</td></tr>`;
}

async function renderContactMessages() {
    const container = document.getElementById("contact-messages-list");
    const { messages } = await apiFetch("admin/contact-messages");

    container.innerHTML = messages.length
        ? messages.map((m) => `
            <div class="card message-item">
                <div class="message-header">
                    <strong>${escapeHtml(m.name)}</strong>
                    <span class="message-date">${new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <p class="message-from">${escapeHtml(m.email)}</p>
                <p>${escapeHtml(m.message)}</p>
            </div>
        `).join("")
        : "<p>No contact messages yet.</p>";
}

async function renderUsers() {
    const tbody = document.querySelector("#users-table tbody");
    const { users, currentUserId } = await apiFetch("admin/users");

    tbody.innerHTML = users.map((u) => `
        <tr>
            <td>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${escapeHtml(u.phone || "")}</td>
            <td><span class="pill ${u.role === "admin" ? "pill-available" : "pill-sold"}"><span class="pill-dot"></span>${escapeHtml(u.role)}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td style="white-space:nowrap">
                ${u._id === currentUserId ? "" : `
                    <button class="btn btn-ghost btn-sm" data-toggle-role="${u._id}" data-current-role="${u.role}">${u.role === "admin" ? "Demote" : "Make Admin"}</button>
                    <button class="btn btn-danger btn-sm" data-delete-user="${u._id}">Delete</button>
                `}
            </td>
        </tr>
    `).join("");
}

async function init() {
    await requireAuth({ roles: ["admin"] });
    wireLogout();

    document.querySelectorAll(".app-sidebar .item[data-view]").forEach((btn) => {
        btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    document.getElementById("pending-listings").addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const { action, id } = button.dataset;
        await apiFetch(`properties/${id}/${action}`, { method: "PATCH" });
        renderPending();
        renderAllProperties();
    });

    document.querySelector("#users-table").addEventListener("click", async (event) => {
        const toggleBtn = event.target.closest("[data-toggle-role]");
        if (toggleBtn) {
            const newRole = toggleBtn.dataset.currentRole === "admin" ? "user" : "admin";
            if (!confirm(`Change this user's role to "${newRole}"?`)) return;
            await apiFetch(`admin/users/${toggleBtn.dataset.toggleRole}/role`, { method: "PATCH", body: { role: newRole } });
            renderUsers();
            return;
        }
        const deleteBtn = event.target.closest("[data-delete-user]");
        if (deleteBtn) {
            if (!confirm("Delete this user? This cannot be undone.")) return;
            await apiFetch(`admin/users/${deleteBtn.dataset.deleteUser}`, { method: "DELETE" });
            renderUsers();
        }
    });

    renderPending();
    renderAllProperties();
    renderContactMessages();
    renderUsers();
}

init();
