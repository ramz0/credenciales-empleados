import { useState, useMemo } from 'react';
import type { Empleado } from '../types/empleado';
import logoImg from '/moneycenter.png';

interface ListaEmpleadosProps {
  empleados: Empleado[];
}

// Función para normalizar nombres (eliminar acentos y caracteres especiales)
// Debe coincidir con la función sanitize_filename del script Python
const sanitizeName = (name: string): string => {
  // Mapa de reemplazos de acentos y caracteres especiales
  const replacements: { [key: string]: string } = {
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
    'á': 'A', 'é': 'E', 'í': 'I', 'ó': 'O', 'ú': 'U',
    'Ñ': 'N', 'ñ': 'N',
    'Ü': 'U', 'ü': 'U',
  };

  let result = name.toUpperCase();

  // Aplicar reemplazos
  for (const [from, to] of Object.entries(replacements)) {
    result = result.replace(new RegExp(from, 'g'), to);
  }

  // Reemplazar espacios por guiones bajos
  result = result.replace(/ /g, '_');

  // Eliminar cualquier caracter que no sea letra, número o guión bajo
  result = result.replace(/[^A-Z0-9_]/g, '');

  return result;
};

// Función para generar la ruta del QR basada en el nombre del empleado
const getQRPath = (nombre: string): string => {
  // Convertir "BRENDA BERMEO MENDOZA" a "BRENDA_BERMEO_MENDOZA.png"
  const qrFileName = sanitizeName(nombre) + '.png';
  return `${import.meta.env.BASE_URL}qr_codes/${qrFileName}`;
};

// Función para descargar el código QR
const downloadQR = async (nombre: string, event: React.MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();

  const qrPath = getQRPath(nombre);
  try {
    const response = await fetch(qrPath);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_${nombre.replace(/ /g, '_').toUpperCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar QR:', error);
  }
};

export default function ListaEmpleados({ empleados }: ListaEmpleadosProps) {
  const [busqueda, setBusqueda] = useState('');
  const [gerenciaFiltro, setGerenciaFiltro] = useState('todas');

  // Obtener lista única de gerencias
  const gerencias = useMemo(() => {
    const lista = Array.from(new Set(empleados.map(emp => emp.gerencia)));
    return lista.sort();
  }, [empleados]);

  // Filtrar empleados
  const empleadosFiltrados = useMemo(() => {
    return empleados.filter(emp => {
      const matchBusqueda =
        emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.id.includes(busqueda) ||
        emp.celular.includes(busqueda);

      const matchGerencia =
        gerenciaFiltro === 'todas' ||
        emp.gerencia === gerenciaFiltro;

      return matchBusqueda && matchGerencia;
    });
  }, [empleados, busqueda, gerenciaFiltro]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ef4444] to-[#b91c1c] py-3 xs:py-4 md:py-8 px-2 xs:px-3 md:px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-3 xs:mb-4 md:mb-8">
          <div className="w-12 h-12 xs:w-14 xs:h-14 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-1.5 xs:mb-2 md:mb-4 shadow-lg overflow-hidden">
            <img
              src={logoImg}
              alt="The Money Center Logo"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <h1 className="text-white text-xl xs:text-2xl md:text-4xl font-bold mb-1 md:mb-2">
            The Money Center
          </h1>
          <p className="text-white/90 text-xs xs:text-sm md:text-lg">
            Directorio de Empleados
          </p>
          <p className="text-white/70 text-[10px] xs:text-xs md:text-sm mt-1 md:mt-2">
            {empleados.length} empleados registrados
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-2 xs:p-3 md:p-6 mb-2 xs:mb-3 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 xs:gap-3 md:gap-4">

            {/* Campo de búsqueda */}
            <div>
              <label className="block text-gray-700 text-[10px] xs:text-xs md:text-sm font-semibold mb-1 md:mb-2">
                Buscar empleado
              </label>
              <input
                type="text"
                placeholder="Nombre, ID o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-2 py-1.5 xs:px-3 xs:py-2 md:px-4 md:py-3 text-xs xs:text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
              />
            </div>

            {/* Filtro por gerencia */}
            <div>
              <label className="block text-gray-700 text-[10px] xs:text-xs md:text-sm font-semibold mb-1 md:mb-2">
                Filtrar por gerencia
              </label>
              <select
                value={gerenciaFiltro}
                onChange={(e) => setGerenciaFiltro(e.target.value)}
                className="w-full px-2 py-1.5 xs:px-3 xs:py-2 md:px-4 md:py-3 text-xs xs:text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-white"
              >
                <option value="todas">Todas las gerencias</option>
                {gerencias.map(gerencia => (
                  <option key={gerencia} value={gerencia}>
                    {gerencia}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          {busqueda || gerenciaFiltro !== 'todas' ? (
            <p className="text-[10px] xs:text-xs md:text-sm text-gray-600 mt-1.5 xs:mt-2 md:mt-4">
              Mostrando {empleadosFiltrados.length} de {empleados.length} empleados
            </p>
          ) : null}
        </div>

        {/* Lista de empleados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 xs:gap-2 md:gap-4">
          {empleadosFiltrados.map((empleado) => (
            <a
              key={empleado.id}
              href={`?id=${empleado.id}`}
              className={`rounded-xl shadow-lg p-2 xs:p-3 md:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group active:scale-95 ${empleado.baja ? 'bg-red-50 border-2 border-red-400' : 'bg-white'}`}
            >
              {/* ID Badge - Truncado para móviles */}
              <div className="flex justify-between items-start mb-1.5 xs:mb-2 md:mb-3">
                <span className="bg-[#ef4444] text-white text-[10px] xs:text-xs font-bold px-1.5 xs:px-2 md:px-3 py-0.5 md:py-1 rounded-full truncate max-w-[70%]" title={`ID: ${empleado.id}`}>
                  ID: {empleado.id.substring(0, 8)}...
                </span>
                <div className="flex items-center gap-1.5">
                  {empleado.baja && (
                    <span className="bg-red-600 text-white text-[9px] xs:text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      BAJA
                    </span>
                  )}
                  <span className="text-gray-400 group-hover:text-[#ef4444] transition-colors text-base xs:text-lg md:text-xl">
                    →
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-2 xs:mb-3 md:mb-4">
                <img
                  src={getQRPath(empleado.nombre)}
                  alt={`QR de ${empleado.nombre}`}
                  className="w-20 h-20 xs:w-24 xs:h-24 md:w-32 md:h-32 object-contain border-2 border-gray-200 rounded-lg p-1 mb-1.5 xs:mb-2"
                  onError={(e) => {
                    // Si no se encuentra el QR, ocultar la imagen
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  onClick={(e) => downloadQR(empleado.nombre, e)}
                  className="px-2 py-1 xs:px-2.5 xs:py-1 bg-[#ef4444] text-white text-[9px] xs:text-[10px] rounded hover:bg-[#dc2626] transition-colors active:bg-[#b91c1c] flex items-center gap-1"
                  title="Descargar código QR"
                >
                  <svg className="w-2.5 h-2.5 xs:w-3 xs:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar
                </button>
              </div>

              {/* Nombre */}
              <h3 className={`font-bold text-xs xs:text-sm md:text-lg mb-1 md:mb-2 transition-colors leading-tight ${empleado.baja ? 'text-red-600 line-through' : 'text-gray-800 group-hover:text-[#ef4444]'}`}>
                {empleado.nombre}
              </h3>

              {/* Puesto */}
              <p className="text-gray-600 text-[10px] xs:text-xs md:text-sm mb-1 md:mb-2">
                {empleado.puesto}
              </p>

              {/* Gerencia */}
              <p className="text-gray-500 text-[10px] xs:text-xs mb-1.5 xs:mb-2 md:mb-3 line-clamp-2">
                {empleado.gerencia}
              </p>

              {/* Celular */}
              <div className="flex items-center text-gray-600 text-[10px] xs:text-xs md:text-sm">
                <span className="mr-1 md:mr-2">📱</span>
                <span>{empleado.celular}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Sin resultados */}
        {empleadosFiltrados.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 xs:p-6 md:p-12 text-center">
            <div className="text-3xl xs:text-4xl md:text-6xl mb-2 xs:mb-3 md:mb-4">🔍</div>
            <h3 className="text-gray-800 text-sm xs:text-base md:text-xl font-bold mb-2">
              No se encontraron empleados
            </h3>
            <p className="text-gray-600 text-xs xs:text-sm md:text-base">
              Intenta con otros términos de búsqueda
            </p>
            <button
              onClick={() => {
                setBusqueda('');
                setGerenciaFiltro('todas');
              }}
              className="mt-2 xs:mt-3 md:mt-4 px-3 py-1.5 xs:px-4 xs:py-2 md:px-6 md:py-2 bg-[#ef4444] text-white text-[10px] xs:text-xs md:text-base rounded-lg hover:bg-[#dc2626] transition-colors active:bg-[#b91c1c]"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
