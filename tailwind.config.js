/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Palet terinspirasi kertas thermal + tinta printer.
        paper: {
          50: "#FBFAF7",
          100: "#F4F2EC",
          200: "#E8E4D9",
        },
        ink: {
          900: "#1B1F23",
          800: "#262B31",
          700: "#3A4149",
          600: "#4A525A", // dipakai di badge jumlah halaman
          500: "#5C6570",
          400: "#79828C", // dipakai teks petunjuk kecil
          300: "#9AA3AC",
          200: "#C7CDD3", // dipakai border tombol secondary
        },
        signal: {
          DEFAULT: "#E1552F", // aksen "tinta panas" untuk aksi utama (Print)
          dark: "#C4431F",
        },
        wire: {
          DEFAULT: "#1F6F5C", // hijau kawat sirkuit, untuk status "Connected"
        },
      },
      fontFamily: {
        display: ["'General Sans'", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,31,35,0.06), 0 8px 24px -12px rgba(27,31,35,0.18)",
      },
    },
  },
  plugins: [],
};
