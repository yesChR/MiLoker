import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

function ParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    let animationFrameId;
    let particles = [];
    let width, height, minR, maxR, PARTICLE_COUNT;

    function setupParticles() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      if (width < 480) {
        minR = 4; maxR = 8; PARTICLE_COUNT = 12;
      } else if (width < 768) {
        minR = 6; maxR = 12; PARTICLE_COUNT = 18;
      } else if (width < 1200) {
        minR = 8; maxR = 14; PARTICLE_COUNT = 24;
      } else {
        minR = 10; maxR = 16; PARTICLE_COUNT = 30;
      }

      particles = Array.from({ length: PARTICLE_COUNT }).map(() => {
        const r = minR + Math.random() * (maxR - minR);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r,
          dx: (Math.random() - 0.5) * 0.15,
          dy: (Math.random() - 0.5) * 0.15,
          color: `hsla(${200 + Math.random() * 60}, 70%, 80%, 0.08)`
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < -p.r) p.x = width + p.r;
        if (p.x > width + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = height + p.r;
        if (p.y > height + p.r) p.y = -p.r;
      }
      animationFrameId = requestAnimationFrame(draw);
    }

    function handleResize() {
      cancelAnimationFrame(animationFrameId);
      setupParticles();
      draw();
    }

    setupParticles();
    draw();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ position: "fixed", top: 0, left: 0, zIndex: 0 }}
    />
  );
}

function FeatureCard({ icon, title, description, color, delay, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up ${delay}`}
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        border: `1.5px solid ${color}20`,
        backdropFilter: 'blur(10px)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Efecto de brillo en hover */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 transition-transform duration-700 ${
          isHovered ? 'translate-x-full' : '-translate-x-full'
        }`}
        style={{ opacity: isHovered ? 0.1 : 0 }}
      />
      
      {/* Contenido */}
      <div className="relative z-10">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl mb-4 mx-auto transition-transform duration-300 group-hover:scale-110"
             style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center mb-2 group-hover:text-gray-900 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors">
          {description}
        </p>
      </div>

      {/* Decoración de esquina */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 rounded-full transform translate-x-8 -translate-y-8 transition-transform duration-300 group-hover:scale-125"
        style={{ backgroundColor: `${color}10` }}
      />
    </div>
  );
}


export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = session?.user?.name;
  const userRole = session?.user?.role;

  // Función para obtener solo el primer nombre
  const obtenerPrimerNombre = (nombreCompleto) => {
    if (!nombreCompleto) return null;
    
    let nombre;
    
    if (nombreCompleto.includes('@')) {
      // Si es email, tomar la parte antes del @
      nombre = nombreCompleto.split('@')[0];
    } else {
      // Si es nombre completo, tomar solo el primer nombre
      nombre = nombreCompleto.split(' ')[0];
    }
    
    // Capitalizar correctamente: primera letra mayúscula, resto minúscula
    return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
  };

  // Funcionalidades por rol basadas en el sistema real
  const getFeaturesByRole = (role) => {
    const ROLES = { ADMINISTRADOR: 1, PROFESOR: 2, ESTUDIANTE: 3 };
    
    const allFeatures = {
      // ADMINISTRADOR
      [ROLES.ADMINISTRADOR]: [
        {
          icon: (
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          title: "Administración",
          description: "Gestiona administradores, docentes, estudiantes y especialidades",
          color: "#3b82f6",
          route: "/administrador/admin",
          delay: "delay-100"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          title: "Casilleros",
          description: "Visualiza y administra todos los armarios y casilleros",
          color: "#8b5cf6",
          route: "/casillero/armario",
          delay: "delay-200"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          title: "Informes",
          description: "Genera reportes y estadísticas del sistema",
          color: "#10b981",
          route: "/informe/informes",
          delay: "delay-300"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm-6 4a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6z" />
            </svg>
          ),
          title: "Tipos de Sanciones",
          description: "Gestiona tipos de sanciones y políticas disciplinarias",
          color: "#f59e0b",
          route: "/administrador/tiposSanciones",
          delay: "delay-400"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm-6 4a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6z" />
            </svg>
          ),
          title: "Períodos",
          description: "Gestiona períodos de solicitud y configuraciones temporales",
          color: "#ef4444",
          route: "/administrador/periodosSolicitud",
          delay: "delay-500"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          title: "Seguridad",
          description: "Gestiona permisos y configuraciones de seguridad del sistema",
          color: "#6366f1",
          route: "/administrador/admin",
          delay: "delay-600"
        }
      ],
      
      // PROFESOR
      [ROLES.PROFESOR]: [
        {
          icon: (
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          title: "Solicitudes",
          description: "Revisa y gestiona solicitudes de casilleros de estudiantes",
          color: "#3b82f6",
          route: "/docente/solicitudes/1",
          delay: "delay-100"
        },

        {
          icon: (
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          title: "Casilleros",
          description: "Visualiza el estado de armarios y casilleros",
          color: "#8b5cf6",
          route: "/casillero/armario",
          delay: "delay-300"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          ),
          title: "Crear Usuarios",
          description: "Registra nuevos estudiantes en el sistema",
          color: "#10b981",
          route: "/docente/crearUsuarios",
          delay: "delay-400"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Incidentes",
          description: "Gestiona reportes de problemas y situaciones",
          color: "#f59e0b",
          route: "/incidente/listaIncidentes",
          delay: "delay-500"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          title: "Informes",
          description: "Consulta estadísticas y genera reportes",
          color: "#6366f1",
          route: "/informe/informes",
          delay: "delay-600"
        }
      ],
      
      // ESTUDIANTE
      [ROLES.ESTUDIANTE]: [
        {
          icon: (
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          title: "Solicitar Casillero",
          description: "Realiza una nueva solicitud de asignación de casillero",
          color: "#3b82f6",
          route: "/estudiante/solicitudCasillero",
          delay: "delay-100"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          title: "Estado Solicitud",
          description: "Consulta el estado de tus solicitudes pendientes",
          color: "#10b981",
          route: "/estudiante/estadoSolicitud",
          delay: "delay-200"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          title: "Mi Casillero",
          description: "Visualiza la información de tu casillero asignado",
          color: "#8b5cf6",
          route: "/estudiante/miLoker",
          delay: "delay-300"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Reportar Incidente",
          description: "Informa sobre problemas con tu casillero",
          color: "#f59e0b",
          route: "/incidente/listaIncidentes",
          delay: "delay-400"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
          title: "Renunciar Casillero",
          description: "Libera tu casillero asignado si ya no lo necesitas",
          color: "#ef4444",
          route: "/estudiante/renunciarCasillero",
          delay: "delay-500"
        },
        {
          icon: (
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
          title: "Mis Incidentes",
          description: "Consulta el historial de incidentes que has reportado",
          color: "#6366f1",
          route: "/incidente/listaIncidentes",
          delay: "delay-600"
        }
      ]
    };

    return allFeatures[role] || [];
  };

  const features = getFeaturesByRole(userRole);

  const handleCardClick = (route) => {
    router.push(route);
  };

  const getRoleDisplayName = (role) => {
    const ROLES = { 1: "Administrador", 2: "Profesor", 3: "Estudiante" };
    return ROLES[role] || "Usuario";
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-white via-sky-50 to-cyan-25 overflow-auto">
      {/* Fondo animado */}
      <ParticlesBackground />

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen">
        {/* Header con bienvenida */}
        <div className="text-center mb-12">
          <div className="hidden md:flex justify-center mb-6">
            <div className="relative">
              <Image
                src="/Logo.png"
                alt="Logo MiLoker"
                width={100}
                height={100}
                className="animate-bounce-slow transition-transform duration-300 hover:scale-110 drop-shadow-lg"
              />
              {/* Anillo decorativo */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse opacity-30 scale-125"></div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 mt-16 md:mt-0 animate-fade-in-scale">
            ¡Bienvenido/a!
          </h1>
          
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent mb-2 animate-fade-in-scale">
            {userName ? obtenerPrimerNombre(userName) : 'MiLoker'}
          </div>
          
          {/* Mostrar rol del usuario */}
          {userRole && (
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4 animate-fade-in-scale delay-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {getRoleDisplayName(userRole)}
            </div>
          )}
          
          {/* Separador mejorado */}
          <div className="flex justify-center mb-6">
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-gradient-x"></div>
          </div>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            {userRole === 1 && "Administra el sistema completo, usuarios y configuraciones"}
            {userRole === 2 && "Gestiona solicitudes y supervisa el sistema"}
            {userRole === 3 && "Solicita casilleros, consulta tu estado y reporta incidencias"}
            {!userRole && "Explora todas las funcionalidades disponibles para gestionar tus casilleros"}
          </p>
        </div>

        {/* Grid de tarjetas de funcionalidades */}
        <div className="max-w-6xl mx-auto space-y-6">
          {features.length > 0 ? (
            <>
              {/* Solo para docentes: separar Incidentes e Informes en fila especial */}
              {userRole === 2 ? (
                <>
                  {/* Tarjetas regulares (sin Incidentes e Informes) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.filter(feature => feature.title !== "Incidentes" && feature.title !== "Informes").map((feature, index) => (
                      <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        color={feature.color}
                        delay={feature.delay}
                        onClick={() => handleCardClick(feature.route)}
                      />
                    ))}
                  </div>
                  
                  {/* Fila especial para Incidentes e Informes - solo docentes */}
                  {features.some(f => f.title === "Incidentes" || f.title === "Informes") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {features.filter(feature => feature.title === "Incidentes" || feature.title === "Informes").map((feature, index) => (
                        <FeatureCard
                          key={`special-${index}`}
                          icon={feature.icon}
                          title={feature.title}
                          description={feature.description}
                          color={feature.color}
                          delay={feature.delay}
                          onClick={() => handleCardClick(feature.route)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Para admin y estudiantes: grid normal */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <FeatureCard
                      key={index}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      color={feature.color}
                      delay={feature.delay}
                      onClick={() => handleCardClick(feature.route)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No hay funcionalidades disponibles para tu rol</p>
            </div>
          )}
        </div>

        {/* Footer decorativo */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-lg animate-fade-in-up delay-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Sistema activo</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <span className="text-sm text-slate-600">¡Disfruta tu experiencia MiLoker!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
