/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neuro: {
                    DEFAULT: '#00B4FF',
                    dark: '#0087C2',
                    light: '#E0F7FF',
                },
                brand: {
                    primary: '#0F172A',
                    secondary: '#334155',
                    accent: '#00B4FF',
                }
            }
        },
    },
    plugins: [],
}
