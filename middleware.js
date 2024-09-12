import { withAuth } from 'next-auth/middleware';

export default withAuth({
    pages: {
      signIn: '/sign-in', // Redirect to this page if not authenticated
    },
  });

// to restrict access on the following pages, to authenticated users only
export const config = { 
    matcher: [
        "/change_password/:path*",
        "/conversations",
        "/home",
        "/home_admin",
        "/listings",
        "/network/:path*",
        "/notifications",
        "/post_view/:path*",
        "/profile_info",
        "/settings/:path*",
        "/view_profile/:path*",
    ]
};