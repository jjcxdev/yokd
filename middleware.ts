import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/exercise(.*)",
  "/routine(.*)",
]);

// Add routes that PWA needs to access
const isPWARoute = createRouteMatcher([
  "/manifest.json",
  "/service-worker.js",
  "/icons/(.*)",
  "/screenshots/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow PWA-related routes to bypass authentication
  if (isPWARoute(req)) return;

  // Protect your app routes
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Include manifest.json and service-worker.js
    "/manifest.json",
    "/service-worker.js",
  ],
};
