import { useEffect, useState } from 'react';
import type { Empleado } from './types/empleado';
import Credencial from './components/Credencial';

type LoadingState = 'loading' | 'success' | 'error';

function App() {
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [vistaCredencial, setVistaCredencial] = useState(false);

  useEffect(() => {
    const cargarEmpleado = async () => {
      // Obtener parámetros de URL
      const urlParams = new URLSearchParams(window.location.search);
      const empleadoId = urlParams.get('id');
      const view = urlParams.get('view');

      // Determinar si se quiere ver la credencial
      setVistaCredencial(view === 'credencial');

      if (!empleadoId) {
        setErrorMessage(
          'No se especificó un ID de empleado. Por favor, use el parámetro ?id=XXX en la URL.'
        );
        setLoadingState('error');
        return;
      }

      try {
        const response = await fetch('./empleados.json');

        if (!response.ok) {
          throw new Error('No se pudo cargar el archivo de empleados');
        }

        const empleados: Empleado[] = await response.json();

        // Buscar el empleado por ID
        const empleadoEncontrado = empleados.find(
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

    cargarEmpleado();
  }, []);

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

  // Vista de directorio normal
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
            <p className="text-red-700">{errorMessage}</p>
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

          </div>
        )}
      </div>
    </div>
  );
}

export default App;
