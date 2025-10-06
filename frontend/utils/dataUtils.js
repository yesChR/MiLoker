
export const ordenarCasillerosPorNumero = (casilleros) => {
    return [...casilleros].sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
};

export const limpiarURLsArchivos = (files) => {
    files.forEach(file => {
        if (file) URL.revokeObjectURL(URL.createObjectURL(file));
    });
};