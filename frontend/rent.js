import { apiFetch, escapeHtml } from "./js/api.js";

function renderPagination(page, pages) {
    const el = document.getElementById("pagination");
    if (pages <= 1) { el.innerHTML = ""; return; }
    el.innerHTML = `
        <button ${page <= 1 ? "disabled" : ""} onclick="changePage(${page - 1})">Prev</button>
        <span>Page ${page} of ${pages}</span>
        <button ${page >= pages ? "disabled" : ""} onclick="changePage(${page + 1})">Next</button>
    `;
}

function currentFilterParams() {
    const params = new URLSearchParams({ listingType: "rent", limit: 9 });

    const search = document.getElementById("search-bar").value;
    if (search) params.set("search", search);

    const type = document.getElementById("filter-type").value;
    if (type) params.set("propertyType", type);

    const bedrooms = document.getElementById("filter-bedrooms").value;
    if (bedrooms) params.set("minBedrooms", bedrooms);

    params.set("sort", document.getElementById("sort-by").value || "newest");

    return params;
}

async function renderRentals(page = 1) {
    const container = document.getElementById("property-list");

    try {
        const params = currentFilterParams();
        params.set("page", page);
        const { properties, pages } = await apiFetch(`properties?${params}`);

        if (properties.length === 0) {
            container.innerHTML = "<p>No rentals match your search.</p>";
            renderPagination(1, 1);
            return;
        }

        container.innerHTML = properties.map((property) => `
            <div class="card card-hover property">
                ${property.imageUrls?.[0] ? `<img src="${property.imageUrls[0]}" alt="${escapeHtml(property.title)}">` : `<div class="property-noimg"></div>`}
                <div class="body">
                    <div class="price">$${Number(property.price).toLocaleString()}/mo</div>
                    <h2>${escapeHtml(property.title)}</h2>
                    <p class="loc">${escapeHtml(property.location)}</p>
                    <div class="property-buttons">
                        <button class="btn btn-ghost btn-sm" onclick="saveToFavorites('${property._id}')"><i data-lucide="heart"></i></button>
                        <a class="btn btn-ghost btn-sm" href="property-details.html?id=${property._id}">View Details</a>
                        <button class="btn btn-primary btn-sm" onclick="window.location.href='contact_seller.html?property=${property._id}'">Inquire</button>
                    </div>
                </div>
            </div>
        `).join("");

        renderPagination(page, pages);
        if (window.lucide) window.lucide.createIcons();
    } catch (error) {
        container.innerHTML = "<p>Could not load rentals. Please try again later.</p>";
    }
}

function applyFilters() {
    renderRentals(1);
}

async function saveToFavorites(propertyId) {
    try {
        await apiFetch("favorites", { method: "POST", body: { propertyId } });
        alert("Added to favorites!");
    } catch (error) {
        if (error.message.includes("Already in favorites")) {
            alert("Already in favorites!");
        } else {
            alert("Please log in to save favorites.");
        }
    }
}

function changePage(page) {
    if (page < 1) return;
    renderRentals(page);
}

window.applyFilters = applyFilters;
window.saveToFavorites = saveToFavorites;
window.changePage = changePage;

document.addEventListener("DOMContentLoaded", () => renderRentals(1));
