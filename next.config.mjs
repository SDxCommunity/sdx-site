/** Chapters served on their own subdomain: <chapter>.sdx.community -> /chapters/<chapter>. */
const CHAPTER_SUBDOMAINS = ['ucsd', 'sdsu'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Serve each chapter at its subdomain, for example ucsd.sdx.community. These must be
    // `beforeFiles`: a plain array is treated as `afterFiles`, which only runs when no
    // page matches, so real routes like `/` and `/events` won the match and the
    // chapter host served the main site instead of the chapter.
    return {
      beforeFiles: CHAPTER_SUBDOMAINS.flatMap((chapter) => [
        {
          source: '/',
          has: [{ type: 'host', value: `${chapter}.sdx.community` }],
          destination: `/chapters/${chapter}`,
        },
        {
          // Map sub-paths under the chapter (e.g. /events, /gallery), but leave
          // Next internals, API routes, generated icons, static files, and
          // already-prefixed /chapters/* paths alone.
          source: '/:path((?!_next/|api/|chapters/|icon$|apple-icon$)(?!.*\\.[^/]+$).*)',
          has: [{ type: 'host', value: `${chapter}.sdx.community` }],
          destination: `/chapters/${chapter}/:path`,
        },
      ]),
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.lu.ma',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.lumacdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '8pd3tfjq1bxzh5qx.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
