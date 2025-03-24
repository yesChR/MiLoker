import React from "react";

const CabezeraDinamica = ({ title, breadcrumb }) => {
  return (
    <div
      className="bg-cabezera p-6 rounded-lg shadow-md flex items-center w-full max-w-5xl mx-auto h-24 relative overflow-hidden"
    >
      {/* Contenedor exclusivo para la imagen */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <img
          src="/imgCabecera.png"
          alt="Imagen de cabecera"
          className="w-20 h-auto"
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        <h2 className="text-2xl font-semibold text-azulOscuro">{title}</h2>
        <p className="text-sm text-gray-500">{breadcrumb}</p>
      </div>
    </div>
  );
};

export default CabezeraDinamica;