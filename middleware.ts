import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ar', 'en', 'fr'],
  defaultLocale: 'ar',
  localeDetection: false
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'  ]
};
