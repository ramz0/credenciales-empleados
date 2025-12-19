import { useEffect, useState } from 'react';
import type { Empleado } from './types/empleado';
import Credencial from './components/Credencial';
import ListaEmpleados from './components/ListaEmpleados';

type LoadingState = 'loading' | 'success' | 'error';

function App() {
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [vistaCredencial, setVistaCredencial] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      // Obtener parámetros de URL
      const urlParams = new URLSearchParams(window.location.search);
      const empleadoId = urlParams.get('id');
      const view = urlParams.get('view');

      // Determinar si se quiere ver la credencial
      setVistaCredencial(view === 'credencial');

      try {
        const response = await fetch('./empleados.json');

        if (!response.ok) {
          throw new Error('No se pudo cargar el archivo de empleados');
        }

        const todosEmpleados: Empleado[] = await response.json();
        setEmpleados(todosEmpleados);

        // Si no hay ID, mostrar lista completa
        if (!empleadoId) {
          setMostrarLista(true);
          setLoadingState('success');
          return;
        }

        // Buscar el empleado por ID
        const empleadoEncontrado = todosEmpleados.find(
          (emp) => emp.id === empleadoId
        );

        if (empleadoEncontrado) {
          setEmpleado(empleadoEncontrado);
          setLoadingState('success');
        } else {
          setErrorMessage(
            `No se encontró ningún empleado con el ID: ${empleadoId}`
          );
          setLoadingState('error');
        }
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage(
          'Error al cargar los datos. Verifique que el archivo empleados.json existe y es válido.'
        );
        setLoadingState('error');
      }
    };

    cargarDatos();
  }, []);

  // Mostrar lista de empleados cuando no hay ID
  if (mostrarLista && loadingState === 'success') {
    return <ListaEmpleados empleados={empleados} />;
  }

  // Si se solicita vista de credencial y hay empleado
  if (vistaCredencial && loadingState === 'success' && empleado) {
    return (
      <Credencial
        empleado={{
          nombre: empleado.nombre,
          puesto: empleado.puesto,
          vigencia: {
            inicio: '2026',
            fin: '2027',
          },
        }}
        logoUrl="https://via.placeholder.com/200/E31E24/FFFFFF?text=TMC"
        nombreEmpresa="THE MONEY CENTER"
      />
    );
  }

  // Vista de directorio individual
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ef4444] to-[#b91c1c] flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center">
        {/* Logo */}
        <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-[#ef4444] to-[#b91c1c] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <span className="text-white text-5xl md:text-6xl font-bold">TMC</span>
        </div>

        {/* Título */}
        <h1 className="text-gray-800 text-3xl md:text-4xl font-bold mb-2">
          The Money Center
        </h1>
        <p className="text-gray-600 text-base md:text-lg mb-8">
          Directorio de Empleados
        </p>

        {/* Estado: Loading */}
        {loadingState === 'loading' && (
          <div className="py-8">
            <div className="w-16 h-16 border-8 border-gray-200 border-t-[#ef4444] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información...</p>
          </div>
        )}

        {/* Estado: Error */}
        {loadingState === 'error' && (
          <div className="bg-red-50 rounded-2xl p-6 mt-5">
            <div className="text-6xl mb-3">⚠️</div>
            <h2 className="text-red-600 text-2xl font-bold mb-2">
              Error al cargar
            </h2>
            <p className="text-red-700 mb-4">{errorMessage}</p>
            <a
              href="."
              className="inline-block px-6 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors"
            >
              Ver todos los empleados
            </a>
          </div>
        )}

        {/* Estado: Success */}
        {loadingState === 'success' && empleado && (
          <div>
            {/* Nombre del empleado */}
            <div className="text-[#ef4444] text-2xl md:text-3xl font-bold mb-6">
              {empleado.nombre}
            </div>

            {/* Tarjeta de información */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 border-b border-gray-200">
                <span className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-1 md:mb-0">
                  ID
                </span>
                <span className="text-gray-800 text-lg md:text-xl font-medium text-left md:text-right">
                  {empleado.id}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 border-b border-gray-200">
                <span className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-1 md:mb-0">
                  Puesto
                </span>
                <span className="text-gray-800 text-lg md:text-xl font-medium text-left md:text-right">
                  {empleado.puesto}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 border-b border-gray-200">
                <span className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-1 md:mb-0">
                  Gerencia
                </span>
                <span className="text-gray-800 text-lg md:text-xl font-medium text-left md:text-right">
                  {empleado.gerencia}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4">
                <span className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-1 md:mb-0">
                  Celular
                </span>
                <span className="text-gray-800 text-lg md:text-xl font-medium text-left md:text-right">
                  {empleado.celular}
                </span>
              </div>
            </div>

            {/* Botón volver a la lista */}
            <div className="mt-6">
              <a
                href="."
                className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                ← Ver todos los empleados
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
