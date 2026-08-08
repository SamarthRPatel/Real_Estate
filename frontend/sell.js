import { apiFetch } from "./js/api.js";

const MAX_IMAGES = 6;

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const imageInput = document.getElementById("image");
const previewsContainer = document.getElementById("image-previews");

imageInput.addEventListener("change", async () => {
    const files = Array.from(imageInput.files).slice(0, MAX_IMAGES);
    if (imageInput.files.length > MAX_IMAGES) {
        alert(`Only the first ${MAX_IMAGES} images will be used.`);
    }

    const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
    previewsContainer.innerHTML = dataUrls.map((url) => `<img src="${url}" alt="Preview">`).join("");
});

document.getElementById("sell-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const files = Array.from(imageInput.files).slice(0, MAX_IMAGES);
    if (files.length === 0) {
        alert("Please upload at least one image!");
        return;
    }

    const imageUrls = await Promise.all(files.map(readFileAsDataUrl));
    const amenitiesRaw = document.getElementById("amenities").value;

    const property = {
        title: document.getElementById("property-title").value,
        location: document.getElementById("location").value,
        price: Number(document.getElementById("price").value),
        propertyType: document.getElementById("property-type").value,
        listingType: document.getElementById("listing-type").value,
        description: document.getElementById("description").value,
        imageUrls,
        bedrooms: Number(document.getElementById("bedrooms").value) || undefined,
        bathrooms: Number(document.getElementById("bathrooms").value) || undefined,
        garage: Number(document.getElementById("garage").value) || undefined,
        area: Number(document.getElementById("area").value) || undefined,
        yearBuilt: Number(document.getElementById("year-built").value) || undefined,
        amenities: amenitiesRaw ? amenitiesRaw.split(",").map(a => a.trim()).filter(Boolean) : [],
    };

    try {
        await apiFetch("properties", { method: "POST", body: property });
        alert("Property submitted for admin approval!");
        window.location.href = "dashboard.html";
    } catch (error) {
        alert("Failed to submit listing: " + error.message);
    }
});
