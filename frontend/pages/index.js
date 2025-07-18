import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const userName = session?.user?.name;
  const userImage = session?.user?.image;
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-white overflow-y-hidden ml-56">
      {/* Fondo animado sutil */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-10 left-1/3 w-72 h-72 bg-gradient-to-br from-primario/20 to-azulOscuro/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-1/4 w-60 h-60 bg-gradient-to-tr from-azulOscuro/20 to-primario/10 rounded-full blur-2xl animate-pulse-slow" />
      </div>
      <div
        className="relative z-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center p-6 md:p-12 max-w-xl w-full animate-fade-in-down border border-white/40 backdrop-blur-xl bg-white/80"
        style={{
          background: 'linear-gradient(120deg,rgba(255,255,255,0.96) 80%,rgba(96,165,250,0.08) 100%)',
          boxShadow: '0 8px 40px 0 rgba(31, 38, 135, 0.12), 0 2px 16px 0 #2563eb18',
          border: '1.5px solid rgba(255,255,255,0.5)',
        }}
      >
        {/* Avatar o logo */}
        <div className="mb-4 flex flex-col items-center justify-center">
          {userImage ? (
            <img src={userImage} alt={userName || 'Usuario'} className="w-24 h-24 rounded-full border-4 border-primario shadow-lg object-cover mb-2 animate-fade-in-up" />
          ) : (
            <Image
              src="/Logo.png"
              alt="Logo MiLoker"
              width={90}
              height={90}
              className="mx-auto animate-bounce-slow transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg cursor-pointer"
            />
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-azulOscuro text-center drop-shadow-lg tracking-tight animate-fade-in-scale">
          ¡Bienvenido!
        </h1>
        <div className="text-2xl md:text-3xl font-extrabold text-primario text-center mb-1 animate-fade-in-scale whitespace-nowrap">
          {userName ? userName : 'MiLoker'}
        </div>
        {/* Separador decorativo animado */}
        <div className="w-28 h-1 mx-auto my-2 bg-gradient-to-r from-primario via-azulOscuro to-primario rounded-full animate-gradient-x shadow-md" />
        <p className="text-base md:text-lg text-gray-600 text-center mb-4 animate-fade-in-up delay-100 font-light">
          Un espacio pensado para ti y la gestión de tus casilleros.
        </p>
        <p className="text-base md:text-base text-azulOscuro text-center mb-6 animate-fade-in-up delay-150 font-semibold">
          Accede a todas las funcionalidades desde el menú lateral.
        </p>
        <div className="flex flex-col items-center gap-2 animate-fade-in-up delay-200">
          <div className="flex items-center gap-4 select-none">
            {/* SVG minimalista de locker */}
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="hover:scale-110 transition-transform duration-200">
              <rect x="7" y="7" width="24" height="24" rx="4" fill="#2563eb" fillOpacity="0.12" />
              <rect x="11" y="11" width="16" height="16" rx="2" fill="#2563eb" />
              <rect x="15" y="15" width="8" height="8" rx="1" fill="#fff" />
            </svg>
            {/* SVG minimalista de llave */}
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="hover:scale-110 transition-transform duration-200">
              <circle cx="24" cy="14" r="6" fill="#fbbf24" />
              <rect x="10" y="22" width="14" height="4" rx="2" fill="#fbbf24" />
              <rect x="10" y="28" width="4" height="4" rx="2" fill="#fbbf24" />
            </svg>
            {/* SVG minimalista de estrella */}
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="hover:scale-110 transition-transform duration-200">
              <polygon points="19,8 22,16 30,16 23.5,21 26,29 19,24.5 12,29 14.5,21 8,16 16,16" fill="#facc15" />
            </svg>
          </div>
          <span className="text-xs md:text-sm text-gray-400 mt-2 font-medium animate-fade-in-up delay-300">¡Explora, administra y disfruta la experiencia!</span>
        </div>
        {/* Mini-banner decorativo */}
        <div className="mt-4 flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primario to-azulOscuro text-white font-semibold shadow-md animate-fade-in-up delay-300 select-none relative overflow-hidden">
          <svg width="22" height="22" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 animate-bounce-slow">
            <rect x="7" y="7" width="24" height="24" rx="4" fill="#fff" fillOpacity="0.18" />
            <rect x="11" y="11" width="16" height="16" rx="2" fill="#fff" fillOpacity="0.5" />
            <rect x="15" y="15" width="8" height="8" rx="1" fill="#2563eb" />
          </svg>
          ¡Comienza tu experiencia MiLoker!
        </div>
      </div>
    </div>
  );
}
