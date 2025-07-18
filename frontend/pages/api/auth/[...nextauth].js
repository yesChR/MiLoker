import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const url = process.env.NEXT_PUBLIC_API_URL;
        try {
          console.log("Iniciando autenticación con la API...");
          
          const res = await fetch(`${url}/api/Usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              CT_Correo_usuario: credentials.email,
              CT_Contrasenna: credentials.password
            })
          });

          console.log("Respuesta API:", res);
          
          // Si la respuesta no es 200 OK, es un error de autenticación
          if (!res.ok) {
            console.log("Autenticación fallida");
            return null;
          }

          const userData = await res.json();
          console.log("Usuario autenticado:", userData);
          
          // IMPORTANTE: Devolver exactamente este formato para NextAuth
          if (userData) {
            return {
              id: String(userData.cN_Id_usuario || userData.CN_Id_usuario),
              name: userData.cT_Nombre_usuario || userData.CT_Nombre_usuario,
              email: userData.cT_Correo_usuario || userData.CT_Correo_usuario,
              role: userData.cN_Id_rol || userData.CN_Id_rol
            };
          }
          
          return null;
        } catch (error) {
          console.error("Error en la autenticación:", error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 2, 
  },
  jwt: {
    maxAge: 60 * 60 * 2, 
  },
  callbacks: {
    async jwt({ token, user }) {
      // Copia los datos del usuario al token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Asegúrate de que session.user exista
      if (!session.user) session.user = {};
      
      // Copia los datos del token a la sesión
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.role = token.role;
      
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
  },
  debug: process.env.NODE_ENV === "development",
});