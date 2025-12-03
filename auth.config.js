export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnCheckout = nextUrl.pathname.startsWith('/checkout');
      
      if (isOnAdmin) {
        if (isLoggedIn && auth.user.role === 'ADMIN') return true;
        return false; // Redirect to login
      }
      
      if (isOnCheckout) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      const isOnProfile = nextUrl.pathname.startsWith('/profile');
      if (isOnProfile) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      if (token.image && session.user) {
        session.user.image = token.image;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    }
  },
  providers: [], // Configured in auth.js
}
