/* Theme Management System */

export function initTheme() {
    // 1. Check local storage
    const storedTheme = localStorage.getItem('theme');
    
    // 2. Check system preference
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // 3. Determine initial theme
    const theme = storedTheme || systemPreference;
    
    // 4. Apply theme
    setTheme(theme);
    
    // 5. Bind toggle button
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
        updateToggleIcon(theme);
    }
    
    // 6. Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
}

function updateToggleIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    // Simple rotation animation
    toggleBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        toggleBtn.style.transform = 'rotate(0deg)';
    }, 300);
    
    // Update accessibility label
    toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

