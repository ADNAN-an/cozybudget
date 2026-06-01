import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cozy Budget",
    short_name: "Budget",
    description: "Personal budget tracker",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2eb",
    theme_color: "#5a8f6e",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
