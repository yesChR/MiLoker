import React from "react";

const CabezeraDinamica = ({ title, breadcrumb }) => {
  return (
    <div className="bg-blue-100 p-4 rounded-lg shadow-md flex items-center">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{breadcrumb}</p>
      </div>
    </div>
  );
};

export default CabezeraDinamica;