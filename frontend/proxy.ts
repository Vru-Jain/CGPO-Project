import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The dashboard is the actual tool — require sign-in. The landing page and
// static assets stay public.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on everything except Next internals and static files...
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|webp|woff2?|ttf|otf|map)).*)",
    // ...and always on API routes.
    "/(api|trpc)(.*)",
  ],
};
