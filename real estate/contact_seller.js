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

    // If the buyer is logged in, prefill from their real account instead of a
    // freely-typed box — the email in particular needs to be trustworthy since
    // it becomes the seller's Reply-To address.
    try {
        const { user } = await apiFetch("auth/me");
        document.getElementById("name").value = `${user.firstName} ${user.lastName}`;
        document.getElementById("phone").value = user.phone || "";

        const emailField = document.getElementById("email");
        emailField.value = user.email;
        emailField.readOnly = true;
        emailField.style.backgroundColor = "var(--bg)";
        emailField.insertAdjacentHTML("afterend", `<p style="font-size:12px; color:var(--text-muted); margin-top:-8px">Using your account email</p>`);
    } catch (error) {
        // Not logged in — leave the fields blank for manual entry, as before.
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
