// ============================================================================
// TICKET-ADV102 — Theme Toggle
//
// Features:
// - Toggle between light and dark themes
// - Persist selected theme using localStorage
// - Restore saved theme on page load
// - Avoid flash of incorrect theme (FOUC)
// ============================================================================

(function () {
    "use strict";

    const STORAGE_KEY = "reconx-theme";
    const DEFAULT_THEME = "light";
    const root = document.documentElement;

    /**
     * Apply the selected theme.
     * @param {string} theme
     */
    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
    }

    /**
     * Returns the saved theme or the default.
     * @returns {string}
     */
    function getStoredTheme() {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    }

    /**
     * Save theme preference.
     * @param {string} theme
     */
    function saveTheme(theme) {
        localStorage.setItem(STORAGE_KEY, theme);
    }

    /**
     * Toggle between light and dark.
     */
    function toggleTheme() {
        const current = root.getAttribute("data-theme") || DEFAULT_THEME;
        const next = current === "light" ? "dark" : "light";

        applyTheme(next);
        saveTheme(next);
        updateButton(next);
    }

    /**
     * Update button appearance.
     * @param {string} theme
     */
    function updateButton(theme) {
        const button = document.getElementById("theme-toggle");

        if (!button) {
            return;
        }

        button.textContent = theme === "dark" ? "☀️" : "🌙";

        button.setAttribute(
            "aria-label",
            theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
        );

        button.setAttribute(
            "title",
            theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
        );
    }

    // ------------------------------------------------------------
    // Apply stored theme immediately (prevents FOUC)
    // ------------------------------------------------------------

    applyTheme(getStoredTheme());

    // ------------------------------------------------------------
    // Initialize once DOM is ready
    // ------------------------------------------------------------

    document.addEventListener("DOMContentLoaded", function () {

        const button = document.getElementById("theme-toggle");

        updateButton(getStoredTheme());

        if (button) {
            button.addEventListener("click", toggleTheme);
        }

    });

})();
