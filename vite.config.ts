import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" so it works on GitHub Pages under any repo name
export default defineConfig({ plugins: [react()], base: "./" });
