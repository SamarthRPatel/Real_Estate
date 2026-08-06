import { apiFetch } from "./js/api.js";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get("property");
    const propertyNameField = document.getElementById("property-name");

    if (propertyId) {
        try {
            const { property } = await apiFetch(`properties/${propertyId}`);
            propertyNameField.value = property.title;
        } catch (error) {
            propertyNameField.value = "Unknown property";
        }
    }

    document.getElementById("contact-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const message = document.getElementById("message").value;

        if (!propertyId) {
            alert("No property selected.");
            return;
        }

        try {
            await apiFetch("inquiries", {
                method: "POST",
                body: { propertyId, name, email, phone, message },
            });
            alert("Message sent to seller!");
            document.getElementById("contact-form").reset();
        } catch (error) {
            alert("Failed to send message: " + error.message);
        }
    });
});
