import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3006', '192.168.1.136:3006', '192.168.1.136'],
    },
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDevelopment
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.privy.io; connect-src 'self' https://*.supabase.co https://*.privy.io; img-src 'self' data: blob: https://*.supabase.co https://picsum.photos https://fastly.picsum.photos; frame-src 'self' https://*.privy.io; style-src 'self' 'unsafe-inline';"
              : "default-src 'self'; script-src 'self' https://cdn.privy.io; connect-src 'self' https://*.supabase.co https://*.privy.io; img-src 'self' data: blob: https://*.supabase.co https://picsum.photos https://fastly.picsum.photos; frame-src 'self' https://*.privy.io; style-src 'self';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: isDevelopment ? 'http://localhost:3000' : 'https://yourdomain.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDevelopment
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.privy.io https://*.privy.io; connect-src 'self' https://*.supabase.co https://*.privy.io https://tempo.network; img-src 'self' data: blob: https://*.supabase.co https://*.privy.io https://picsum.photos https://fastly.picsum.photos; frame-src 'self' https://*.privy.io; style-src 'self' 'unsafe-inline';"
              : "default-src 'self'; script-src 'self' https://cdn.privy.io https://*.privy.io; connect-src 'self' https://*.supabase.co https://*.privy.io https://tempo.network; img-src 'self' data: blob: https://*.supabase.co https://*.privy.io https://picsum.photos https://fastly.picsum.photos; frame-src 'self' https://*.privy.io; style-src 'self';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: isDevelopment ? 'max-age=0' : 'max-age=31536000; includeSubDomains'
          }
        ],
      }
    ];
  },
};

export default nextConfig;
