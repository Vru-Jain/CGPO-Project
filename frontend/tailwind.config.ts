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
                background: "#050505",
                card: "#0A0A0A",
                primary: "#FF9900", // Amber
                secondary: "#00F0FF", // Cyber Cyan
                danger: "#FF3333",
                success: "#33FF57",
                border: "#222222",
                textDim: "#888888",
            },
            fontFamily: {
                mono: ['"IBM Plex Mono"', '"Roboto Mono"', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
};
export default config;
