import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { protectedPaths } from "./lib/constant";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getSession();
  const url = new URL(request.url);

  // Public paths that don't require onboarding
  const publicPaths = [
    "/sign-in",
    "/sign-up",
    "/auth/callback",
    "/onboarding",
    "/schedule-call",
  ];

  if (data.session) {
    // Get user profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", data.session.user.id)
      .single();

    if (url.pathname === "/sign-in") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If onboarding is not completed and user is not on onboarding page
    if (!profile?.onboarding_completed && !publicPaths.includes(url.pathname)) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return response;
  } else {
    if (protectedPaths.includes(url.pathname)) {
      return NextResponse.redirect(
        new URL("/sign-in?next=" + url.pathname, request.url)
      );
    }
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
