export const authConfig = {
  pages: {
    signIn: '/login',
  },
  logger: {
    error(error) {




      if (error?.type === 'JWTSessionError') {
        console.warn('[auth] Ignored a session cookie signed with an old secret.');
        return;
      }
      console.error(error);
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnCheckout = nextUrl.pathname.startsWith('/checkout');
      
      if (isOnAdmin) {
        if (isLoggedIn && auth.user.role === 'ADMIN') return true;
        return false; 
      }
      
      if (isOnCheckout) {
        if (isLoggedIn) return true;
        return false; 
      }

      const isOnProfile = nextUrl.pathname.startsWith('/profile');
      if (isOnProfile) {
        if (isLoggedIn) return true;
        return false; 
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.image = user.image;
      }
      if (trigger === 'update' && session?.user) {

        if (session.user.name) token.name = session.user.name;
        if (session.user.image) token.image = session.user.image;
      }
      return token;
    }
  },
  providers: [], 
}
