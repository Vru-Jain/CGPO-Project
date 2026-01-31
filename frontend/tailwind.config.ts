import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#090E25", // --aden-color-brand-bg
                card: "#141C3A", // Slightly lighter for cards
                primary: "#263A99", // --aden-color-brand-blue / --aden-color-btn
                primaryHover: "#1733C1", // --aden-color-btn-hover
                secondary: "#F9F5EC", // --aden-color-brand-floral
                accent: "#C1392B", // --aden-color-brand-red
                danger: "#F56C6C", // --el-color-danger
                success: "#67C23A", // --el-color-success
                warning: "#E6A23C", // --el-color-warning
                border: "#1F2336",
                textDim: "#A8ABB2", // --el-text-color-placeholder
            },
            fontFamily: {
                mono: ['"IBM Plex Mono"', 'monospace'],
                sans: ['"Bricolage Grotesque"', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
};
export default config;
