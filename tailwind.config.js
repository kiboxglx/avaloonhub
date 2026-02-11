/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#020617", // Slate-950
                card: "#0f172a", // Slate-900
                border: "#1e293b",
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
