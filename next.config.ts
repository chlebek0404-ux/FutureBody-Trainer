import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Bez poprawnego typu MIME przeglądarka potrafi odrzucić manifest
        // i nie zaproponować instalacji aplikacji.
        source: '/manifest.webmanifest',
        headers: [{ key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' }],
      },
      {
        // Service worker nie może być trzymany w pamięci podręcznej przeglądarki,
        // inaczej aktualizacje aplikacji nie docierają do użytkownika.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
