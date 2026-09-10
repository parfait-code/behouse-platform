/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // Photos des biens servies depuis le stockage Neon (compatible S3).
        protocol: 'https',
        hostname: '**.storage.c-5.eu-central-1.aws.neon.tech',
      },
    ],
  },
};

export default nextConfig;
