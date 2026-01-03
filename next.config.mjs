/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
