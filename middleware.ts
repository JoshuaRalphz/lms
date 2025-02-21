import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { isTeacher } from '@/lib/instructor'

const isPublicRoute = createRouteMatcher([
  '/', 
  '/learning', 
  '/vid', 
  '/quizzes', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/uploadthing(.*)',
  '/api/certificate(.*)'
]);

const isInstructorRoute = createRouteMatcher([
  '/instructor(.*)',
  '/instructor/quiz(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  // Redirect to preference page after sign-in
  if (request.nextUrl.pathname === '/') {
    const { userId } = await auth()
    if (userId) {
      return Response.redirect(new URL('/preference', request.url))
    }
  }

  if (isInstructorRoute(request)) {
    const { userId } = await auth()
    if (!isTeacher(userId)) {
      return Response.redirect(new URL('/', request.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}