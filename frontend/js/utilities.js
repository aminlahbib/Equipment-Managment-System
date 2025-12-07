export function showNavbar() {
    document.getElementById("navbar").classList.remove("hidden");
}

export function hideNavbar() {
    document.getElementById("navbar").classList.add("hidden");
}


export function setFieldInvalid(fieldId, errorMessage = "") {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add("invalid-input");
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.innerText = errorMessage;
        }
    }
}

export function removeInvalidState(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove("invalid-input");
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.innerText = "";
        }
    }
}

export function decodeToken(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
}