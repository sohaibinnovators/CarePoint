import type { MetadataRoute } from "next";

/** Public marketing pages may be indexed; role dashboards are demo-only. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/doctors", "/services", "/contact", "/appointment", "/login", "/signup"],
        disallow: ["/admin", "/doctor", "/receptionist", "/patient"],
      },
    ],
  };
}
