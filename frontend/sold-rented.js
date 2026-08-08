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
    const params = new URLSearchParams({ status: "sold_or_rented", limit: 9 });

    const search = document.getElementById("search-bar").value;
    if (search) params.set("search", search);

    const type = document.getElementById("filter-type").value;
    if (type) params.set("propertyType", type);

    return params;
}

async function renderListings(page = 1) {
    const container = document.getElementById("property-list");

    try {
        const params = currentFilterParams();
        params.set("page", page);
        const { properties, pages } = await apiFetch(`properties?${params}`);

        if (properties.length === 0) {
            container.innerHTML = "<p>Nothing sold or rented yet.</p>";
            renderPagination(1, 1);
            return;
        }

        container.innerHTML = properties.map((property) => {
            const stampLabel = property.status === "rented" ? "RENTED" : "SOLD";
            const priceLabel = `$${Number(property.price).toLocaleString()}${property.listingType === "rent" ? "/mo" : ""}`;
            return `
                <div class="card property sold-card">
                    <div class="sold-image-wrap">
                        ${property.imageUrls?.[0] ? `<img src="${property.imageUrls[0]}" alt="${escapeHtml(property.title)}">` : `<div class="property-noimg"></div>`}
                        <span class="sold-stamp">${stampLabel}</span>
                    </div>
                    <div class="body">
                        <div class="price">${priceLabel}</div>
                        <h2>${escapeHtml(property.title)}</h2>
                        <p class="loc">${escapeHtml(property.location)}</p>
                        <div class="property-buttons">
                            <a class="btn btn-ghost btn-sm" href="property-details.html?id=${property._id}">View Details</a>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        renderPagination(page, pages);
        if (window.lucide) window.lucide.createIcons();
    } catch (error) {
        container.innerHTML = "<p>Could not load listings. Please try again later.</p>";
    }
}

function applyFilters() {
    renderListings(1);
}

function changePage(page) {
    if (page < 1) return;
    renderListings(page);
    window.scrollTo({ top: document.getElementById("property-list").offsetTop - 100, behavior: "smooth" });
}

window.applyFilters = applyFilters;
window.changePage = changePage;

document.addEventListener("DOMContentLoaded", () => renderListings(1));
