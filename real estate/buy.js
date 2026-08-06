import { apiFetch, escapeHtml } from "./js/api.js";

const PRICE_BUCKETS = {
    low: { maxPrice: 299999 },
    medium: { minPrice: 300000, maxPrice: 700000 },
    high: { minPrice: 700001 },
};

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
    const params = new URLSearchParams({ listingType: "sale", limit: 9 });

    const search = document.getElementById("search-bar").value;
    if (search) params.set("search", search);

    const priceBucket = PRICE_BUCKETS[document.getElementById("filter-price").value];
    if (priceBucket) {
        if (priceBucket.minPrice) params.set("minPrice", priceBucket.minPrice);
        if (priceBucket.maxPrice) params.set("maxPrice", priceBucket.maxPrice);
    }

    const type = document.getElementById("filter-type").value;
    if (type) params.set("propertyType", type);

    const bedrooms = document.getElementById("filter-bedrooms").value;
    if (bedrooms) params.set("minBedrooms", bedrooms);

    const bathrooms = document.getElementById("filter-bathrooms").value;
    if (bathrooms) params.set("minBathrooms", bathrooms);

    params.set("sort", document.getElementById("sort-by").value || "newest");

    return params;
}

async function renderListings(page = 1) {
    const container = document.getElementById("property-list");

    try {
        const params = currentFilterParams();
        params.set("page", page);
        const { properties, pages } = await apiFetch(`properties?${params}`);

        if (properties.length === 0) {
            container.innerHTML = "<p>No properties for sale match your search.</p>";
            renderPagination(1, 1);
            return;
        }

        container.innerHTML = properties.map((property) => `
            <div class="card card-hover property">
                ${property.imageUrls?.[0] ? `<img src="${property.imageUrls[0]}" alt="${escapeHtml(property.title)}">` : `<div class="property-noimg"></div>`}
                <div class="body">
                    <div class="price">$${Number(property.price).toLocaleString()}</div>
                    <h2>${escapeHtml(property.title)}</h2>
                    <p class="loc">${escapeHtml(property.location)}</p>
                    <p>${escapeHtml(property.description || "")}</p>
                    <div class="property-buttons">
                        <button class="btn btn-ghost btn-sm" onclick="saveToFavorites('${property._id}')"><i data-lucide="heart"></i></button>
                        <a class="btn btn-ghost btn-sm" href="property-details.html?id=${property._id}">View Details</a>
                        <button class="btn btn-primary btn-sm" onclick="contactSeller('${property._id}')">Contact Seller</button>
                    </div>
                </div>
            </div>
        `).join("");

        renderPagination(page, pages);
        if (window.lucide) window.lucide.createIcons();
    } catch (error) {
        container.innerHTML = "<p>Could not load listings. Please try again later.</p>";
    }
}

function applyFilters() {
    renderListings(1);
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

function contactSeller(propertyId) {
    window.location.href = `contact_seller.html?property=${propertyId}`;
}

function changePage(page) {
    if (page < 1) return;
    renderListings(page);
    window.scrollTo({ top: document.getElementById("property-list").offsetTop - 100, behavior: "smooth" });
}

window.applyFilters = applyFilters;
window.saveToFavorites = saveToFavorites;
window.contactSeller = contactSeller;
window.changePage = changePage;

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get("search");
    if (search) document.getElementById("search-bar").value = search;
    renderListings(1);
});
