import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'utfs.io'},
      { hostname: 'img.clerk.com'}
    ],
    domains: ['cdn.yourdomain.com'],
  },
  compress: true,
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  poweredByHeader: false,
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Link',
            value: '</_next/static/css/styles.css>; rel=preload; as=style'
          },
          {
            key: 'Link',
            value: '</_next/static/chunks/main.js>; rel=preload; as=script'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  swcMinify: true,
  experimental: {
    optimizeFonts: true,
    optimizeCss: true
  }
};

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
  buildExcludes: [
    /middleware-manifest\.json$/,
    /_buildManifest\.js$/,
    /_middlewareManifest\.js$/,
    /_ssgManifest\.js$/,
    /_app-build-manifest\.json$/,
  ],
  sw: 'sw.js',
});

export default withPWA(nextConfig);
