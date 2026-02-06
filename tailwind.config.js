/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                colors: {
                    primary: {
                        DEFAULT: 'var(--primary)',
                        hover: 'var(--primary-hover)',
                    },
                    secondary: 'var(--secondary)',
                }
            }
        },
    },
    plugins: [],
}
