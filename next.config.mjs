/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The gallery page and the /photographs route read image files from the
  // ./photographs directory at runtime. Next's output file tracing wouldn't
  // otherwise know to ship those files into the serverless bundle, so include
  // them explicitly for both consumers.
  outputFileTracingIncludes: {
    "/photography": ["./photographs/**/*"],
    "/photographs/[...slug]": ["./photographs/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.alexng.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
