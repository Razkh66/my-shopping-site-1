import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.tsx", "./components/**/*.tsx"],
  theme: { extend: { colors: { cream: "#FAF3E3", brown: "#5B3A24", tan: "#C9A27C" } } }, plugins: [] } satisfies Config;
