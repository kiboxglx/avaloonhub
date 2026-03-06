/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--base-bg)",
                card: "var(--base-card)",
                border: "var(--base-border)",
                main: "var(--text-main)",
                muted: "var(--text-muted)",
                dim: "var(--text-dim)",
                primary: {
                    light: "#ef4444",
                    DEFAULT: "#ec5b13",
                    dark: "#c2410c",
                },
                avaloon: {
                    orange: "#ec5b13",
                    red: "#ef4444",
                }
            },
            backgroundImage: {
                'avaloon-gradient': 'linear-gradient(to right, #ec5b13, #ef4444)',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            }
        },
    },
    plugins: [],
}
