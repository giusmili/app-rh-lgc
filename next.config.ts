import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/report-pdf": ["./node_modules/pdfkit/js/data/**/*"]
  }
};

export default nextConfig;
