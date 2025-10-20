/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://192.168.1.254:3000',
    ],
  },
  images: {
    // Configuración moderna para dominios remotos
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
      },
      {
        protocol: 'http',
        hostname: 'api.miloker.ctpliv',
      },
    ],
    // Formatos soportados
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
