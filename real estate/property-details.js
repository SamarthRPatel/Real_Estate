import { apiFetch, escapeHtml } from "./js/api.js";

function statPill(icon, label, value) {
    if (value === undefined || value === null || value === "") return "";
    return `<div class="stat-pill"><i data-lucide="${icon}"></i><span>${escapeHtml(String(value))} ${escapeHtml(label)}</span></div>`;
}

function calcMonthlyPayment(loanAmount, ratePercent, years) {
    const monthlyRate = ratePercent / 100 / 12;
    const months = years * 12;
    if (!loanAmount || !monthlyRate || !months) return null;
    return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

async function renderSimilar(property) {
    try {
        const { properties } = await apiFetch(`properties?propertyType=${property.propertyType}&listingType=${property.listingType}&limit=4`);
        const similar = properties.filter((p) => p._id !== property._id).slice(0, 3);
        if (similar.length === 0) return "";
        return `
            <section class="similar-section">
                <h2>Similar Properties</h2>
                <div class="similar-grid">
                    ${similar.map((p) => `
                        <a class="card card-hover similar-card" href="property-details.html?id=${p._id}">
                            ${p.imageUrls?.[0] ? `<img src="${p.imageUrls[0]}" alt="${escapeHtml(p.title)}">` : `<div class="property-noimg"></div>`}
                            <div class="body">
                                <div class="price">$${Number(p.price).toLocaleString()}${p.listingType === "rent" ? "/mo" : ""}</div>
                                <div>${escapeHtml(p.title)}</div>
                            </div>
                        </a>
                    `).join("")}
                </div>
            </section>
        `;
    } catch (error) {
        return "";
    }
}

async function render() {
    const container = document.getElementById("page-content");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        container.innerHTML = "<p>No property specified.</p>";
        return;
    }

    let property;
    try {
        ({ property } = await apiFetch(`properties/${id}`));
    } catch (error) {
        container.innerHTML = "<p>This property could not be found.</p>";
        return;
    }

    const priceLabel = `$${Number(property.price).toLocaleString()}${property.listingType === "rent" ? "/mo" : ""}`;
    const monthly = property.listingType === "sale" ? calcMonthlyPayment(property.price, 6.5, 30) : null;

    const images = property.imageUrls || [];

    container.innerHTML = `
        <div class="details-hero">
            ${images.length > 0
                ? `<img id="hero-image" src="${images[0]}" alt="${escapeHtml(property.title)}">`
                : `<div class="property-noimg" style="height:100%"></div>`}
        </div>
        ${images.length > 1 ? `
            <div class="thumb-strip">
                ${images.map((url, i) => `<img src="${url}" data-thumb="${i}" class="${i === 0 ? "active" : ""}" alt="Photo ${i + 1}">`).join("")}
            </div>
        ` : ""}

        <div class="details-layout">
            <div class="details-main">
                <div class="price">${priceLabel}</div>
                <h1>${escapeHtml(property.title)}</h1>
                <p class="loc"><i data-lucide="map-pin"></i> ${escapeHtml(property.location)}</p>

                <div class="stats-row">
                    ${statPill("bed-double", "bed", property.bedrooms)}
                    ${statPill("bath", "bath", property.bathrooms)}
                    ${statPill("car", "garage", property.garage)}
                    ${statPill("ruler", "sqft", property.area)}
                    ${statPill("calendar", "built", property.yearBuilt)}
                </div>

                <h2>Description</h2>
                <p>${escapeHtml(property.description || "No description provided.")}</p>

                ${property.amenities && property.amenities.length > 0 ? `
                    <h2>Amenities</h2>
                    <div class="amenity-chips">
                        ${property.amenities.map((a) => `<span class="pill pill-available"><span class="pill-dot"></span>${escapeHtml(a)}</span>`).join("")}
                    </div>
                ` : ""}
            </div>

            <aside class="details-side">
                <div class="card contact-agent-card">
                    <h3>Interested in this property?</h3>
                    <a class="btn btn-primary btn-block" href="contact_seller.html?property=${property._id}">Contact Seller</a>
                    <button class="btn btn-ghost btn-block" id="save-btn" style="margin-top:8px">Save to Favorites</button>
                </div>

                ${monthly ? `
                    <div class="card mortgage-card">
                        <h3>Mortgage Estimate</h3>
                        <p style="font-size:12px">Based on 6.5% APR, 30-year term.</p>
                        <div class="price tabular" style="font-size:22px">$${monthly.toFixed(0)}<span style="font-size:13px;color:var(--text-muted)">/mo</span></div>
                        <a href="calculator.html?price=${property.price}" class="btn btn-ghost btn-sm" style="margin-top:10px">Open Full Calculator</a>
                    </div>
                ` : ""}
            </aside>
        </div>

        <div id="similar-container"></div>
    `;

    const thumbStrip = document.querySelector(".thumb-strip");
    if (thumbStrip) {
        thumbStrip.addEventListener("click", (event) => {
            const thumb = event.target.closest("[data-thumb]");
            if (!thumb) return;
            document.getElementById("hero-image").src = images[Number(thumb.dataset.thumb)];
            thumbStrip.querySelectorAll("img").forEach((img) => img.classList.remove("active"));
            thumb.classList.add("active");
        });
    }

    document.getElementById("save-btn").addEventListener("click", async () => {
        try {
            await apiFetch("favorites", { method: "POST", body: { propertyId: property._id } });
            alert("Added to favorites!");
        } catch (error) {
            alert(error.message.includes("Already in favorites") ? "Already in favorites!" : "Please log in to save favorites.");
        }
    });

    document.getElementById("similar-container").innerHTML = await renderSimilar(property);
    if (window.lucide) window.lucide.createIcons();
}

render();
