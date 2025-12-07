import { initTheme } from './theme.js';
import { decodeToken, showNavbar, hideNavbar } from './utilities.js';

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    
    // Handle initial route or hash change
    handleRoute();
    window.addEventListener("hashchange", handleRoute);
    
    // Check auth state for nav links
    updateNavigation();
});

function handleRoute() {
    const hash = window.location.hash.substring(1);
    
    // If no hash (landing page), don't load any template
    if (!hash) {
        const container = document.getElementById("container");
        // Restore landing page if it was cleared (optional, depending on SPA structure)
        // Ideally, index.html has the landing page by default
        return;
    }
    
    loadPage(hash);
}

export function loadPage(path) {
    if (path === "") return;

    // Check authentication
    const token = sessionStorage.getItem("authentication_token");
    if (token) {
        const decodedToken = decodeToken(token);
        if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
            sessionStorage.removeItem("authentication_token");
            window.location.hash = "login";
            return;
        }
    }

    // Protected routes redirect
    if (!token && path !== "register" && path !== "login" && path !== "forgot-password") {
        window.location.hash = "login";
        return;
    }

    // Handle Navbar Visibility
    if (path === "login" || path === "register" || path === "forgot-password") {
        hideNavbar();
    } else {
        showNavbar();
    }

    const container = document.getElementById("container");
    
    // Show loading state
    container.innerHTML = `
        <div class="flex-center" style="min-height: 60vh;">
            <div class="spinner"></div>
        </div>
    `;

    const request = new XMLHttpRequest();
    request.open("GET", "./templates/" + path + ".html");
    request.send();
    request.onload = function() {
        if (request.status == 200) {
            container.innerHTML = request.responseText;
            // Add fade-in class to the loaded content
            const firstChild = container.firstElementChild;
            if (firstChild) firstChild.classList.add('fade-in');
            
            document.title = "Equipment Management | " + formatTitle(path);
            loadJS(path);
            updateNavigation();
            window.location.hash = path;
        } else {
            container.innerHTML = `
                <div class="text-center mt-2xl">
                    <h2>Page Not Found</h2>
                    <p>The page you are looking for doesn't exist.</p>
                    <a href="/" class="btn btn-primary">Go Home</a>
                </div>
            `;
        }
    };
}

function formatTitle(path) {
    return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function loadJS(route) {
    const id = route + "-script";
    
    // Remove existing page-specific scripts
    const existingScript = document.getElementById(id);
    if (existingScript) {
        existingScript.remove();
    }

    let scriptEle = document.createElement("script");
    scriptEle.id = id;
    scriptEle.setAttribute("src",  "./js/" + route + ".js?" + Math.random());
    scriptEle.setAttribute("type", "module");
    scriptEle.async = true;

    document.body.appendChild(scriptEle);
}

export function signOut() {
    sessionStorage.clear();
    window.location.hash = "login";
    window.location.reload(); // Full reload to clear state
}

// Make globally available for onclick handlers in HTML
window.loadPage = (path) => {
    window.location.hash = path;
};

window.signOut = signOut;

function updateNavigation() {
    const token = sessionStorage.getItem("authentication_token");
    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');
    
    if (token) {
        if (authLinks) authLinks.classList.add('hidden');
        if (userLinks) userLinks.classList.remove('hidden');
    } else {
        if (authLinks) authLinks.classList.remove('hidden');
        if (userLinks) userLinks.classList.add('hidden');
    }
}
