export function getConvexUrl() {
  return (
    process.env.CONVEX_URL ??
    process.env.NEXT_PUBLIC_CONVEX_URL ??
    process.env.VITE_CONVEX_URL
  );
}
