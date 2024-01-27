const typography = require("@tailwindcss/typography");
const forms = require("@tailwindcss/forms");
const daisyui = require("daisyui")


/** @type {import('tailwindcss').Config}*/
const config = {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    theme: {
        extend: {},
    },

    daisyui: {
        themes: [
            {
                mytheme: {
                    "primary": "#ffffff",
                    "secondary": "#ffffff",
                    "accent": "#ffffff",
                    "neutral": "#f3f4f6",
                    "base-100": "#f3f4f6",
                    "info": "#38bdf8",
                    "success": "#4ade80",
                    "warning": "#facc15",
                    "error": "#f87171",
                },
            },
        ],
    },
    plugins: [forms, typography, daisyui],
};

module.exports = config;
