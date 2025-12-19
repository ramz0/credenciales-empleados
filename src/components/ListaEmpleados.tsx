import { useState, useMemo } from 'react';
import type { Empleado } from '../types/empleado';

interface ListaEmpleadosProps {
  empleados: Empleado[];
}

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
    <div className="min-h-screen bg-gradient-to-br from-[#ef4444] to-[#b91c1c] py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-[#ef4444] text-3xl font-bold">TMC</span>
          </div>
          <h1 className="text-white text-4xl font-bold mb-2">
            The Money Center
          </h1>
          <p className="text-white/90 text-lg">
            Directorio de Empleados
          </p>
          <p className="text-white/70 text-sm mt-2">
            {empleados.length} empleados registrados
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Campo de búsqueda */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Buscar empleado
              </label>
              <input
                type="text"
                placeholder="Nombre, ID o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
              />
            </div>

            {/* Filtro por gerencia */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Filtrar por gerencia
              </label>
              <select
                value={gerenciaFiltro}
                onChange={(e) => setGerenciaFiltro(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent bg-white"
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
            <p className="text-sm text-gray-600 mt-4">
              Mostrando {empleadosFiltrados.length} de {empleados.length} empleados
            </p>
          ) : null}
        </div>

        {/* Lista de empleados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empleadosFiltrados.map((empleado) => (
            <a
              key={empleado.id}
              href={`?id=${empleado.id}`}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              {/* ID Badge */}
              <div className="flex justify-between items-start mb-3">
                <span className="bg-[#ef4444] text-white text-xs font-bold px-3 py-1 rounded-full">
                  ID: {empleado.id}
                </span>
                <span className="text-gray-400 group-hover:text-[#ef4444] transition-colors">
                  →
                </span>
              </div>

              {/* Nombre */}
              <h3 className="text-gray-800 font-bold text-lg mb-2 group-hover:text-[#ef4444] transition-colors">
                {empleado.nombre}
              </h3>

              {/* Puesto */}
              <p className="text-gray-600 text-sm mb-2">
                {empleado.puesto}
              </p>

              {/* Gerencia */}
              <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                {empleado.gerencia}
              </p>

              {/* Celular */}
              <div className="flex items-center text-gray-600 text-sm">
                <span className="mr-2">📱</span>
                <span>{empleado.celular}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Sin resultados */}
        {empleadosFiltrados.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-gray-800 text-xl font-bold mb-2">
              No se encontraron empleados
            </h3>
            <p className="text-gray-600">
              Intenta con otros términos de búsqueda
            </p>
            <button
              onClick={() => {
                setBusqueda('');
                setGerenciaFiltro('todas');
              }}
              className="mt-4 px-6 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
