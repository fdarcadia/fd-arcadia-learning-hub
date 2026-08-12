import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FD Arcadia Learning Hub",
    short_name: "FD Learning Hub",
    description: "FD Arcadia Learning Hub",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0B1F3A",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}