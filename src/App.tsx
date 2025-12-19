import { useEffect, useState, useRef } from 'react';
import type { Empleado } from './types/empleado';
import Credencial from './components/Credencial';
import ListaEmpleados from './components/ListaEmpleados';
import logoImg from '/moneycenter.png';

type LoadingState = 'loading' | 'success' | 'error';

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
  const qrFileName = sanitizeName(nombre) + '.png';
  return `${import.meta.env.BASE_URL}qr_codes/${qrFileName}`;
};

// Función para descargar el código QR
const downloadQR = async (nombre: string) => {
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

function App() {
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [vistaCredencial, setVistaCredencial] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false);

  // Estados de seguridad
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isIntegrityValid, setIsIntegrityValid] = useState(true);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const originalDataRef = useRef<string>('');

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

  // Capa 2: Timestamp dinámico
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Capa 3: Detector de integridad mejorado con MutationObserver
  useEffect(() => {
    if (empleado && !mostrarLista) {
      if (!originalDataRef.current) {
        originalDataRef.current = empleado.nombre + empleado.puesto + empleado.celular;
      }

      // Delay de 3 segundos para permitir que la página cargue completamente
      const startupDelay = setTimeout(() => {
        // Verificar cambios en los datos de JavaScript
        const checkIntegrity = () => {
          if (empleado) {
            const currentData = empleado.nombre + empleado.puesto + empleado.celular;
            if (currentData !== originalDataRef.current) {
              setIsIntegrityValid(false);
            }
          }
        };

        // Detectar modificaciones directas al DOM HTML
        let observerActive = false;
        const observer = new MutationObserver((mutations) => {
          // Ignorar mutaciones durante los primeros 500ms después de activar el observer
          if (!observerActive) return;

          for (const mutation of mutations) {
            // Ignorar cambios en imágenes (QR codes pueden fallar y cambiar display)
            if (mutation.target instanceof HTMLImageElement) {
              continue;
            }

            // Solo detectar cambios en el contenido del texto
            if (mutation.type === 'characterData') {
              const target = mutation.target as Node;
              const parent = target.parentElement;

              // Si modifican texto dentro de campos críticos (nombre, puesto, celular)
              if (parent?.closest('.bg-gray-50') || parent?.closest('[class*="ef4444"]')) {
                setIsIntegrityValid(false);
              }
            }
          }
        });

        // Observar el div principal de la app
        const targetNode = document.querySelector('.bg-white.rounded-3xl');
        if (targetNode) {
          observer.observe(targetNode, {
            subtree: true,
            characterData: true,
            characterDataOldValue: true
          });

          // Activar el observer después de un pequeño delay adicional
          setTimeout(() => {
            observerActive = true;
          }, 500);
        }

        const integrityTimer = setInterval(checkIntegrity, 2000);

        return () => {
          clearInterval(integrityTimer);
          observer.disconnect();
        };
      }, 3000);

      return () => {
        clearTimeout(startupDelay);
      };
    }
  }, [empleado, mostrarLista]);

  // Capa 4: Detector de DevTools (solo en desktop)
  useEffect(() => {
    if (!mostrarLista && empleado) {
      // Detectar si es dispositivo móvil
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (window.innerWidth <= 768);

      // Solo activar detector en desktop
      if (!isMobile) {
        const detectDevTools = () => {
          // Threshold mucho más grande para evitar falsos positivos
          const threshold = 300;
          const widthThreshold = window.outerWidth - window.innerWidth > threshold;
          const heightThreshold = window.outerHeight - window.innerHeight > threshold;

          // Ambas condiciones deben cumplirse para considerar DevTools abierto
          if (widthThreshold && heightThreshold) {
            setDevToolsOpen(true);
          }
        };

        const devToolsTimer = setInterval(detectDevTools, 1000);
        window.addEventListener('resize', detectDevTools);

        return () => {
          clearInterval(devToolsTimer);
          window.removeEventListener('resize', detectDevTools);
        };
      }
    }
  }, [mostrarLista, empleado]);

  // Formatear fecha y hora
  const formatDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  };

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
        logoUrl={logoImg}
        nombreEmpresa="THE MONEY CENTER"
      />
    );
  }

  // Si se detecta manipulación del contenido, mostrar pantalla de bloqueo
  if (!isIntegrityValid && empleado) {
    return (
      <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-7xl mb-4">🚨</div>
          <h1 className="text-red-600 text-2xl md:text-3xl font-bold mb-4">
            CONTENIDO MANIPULADO
          </h1>
          <p className="text-gray-700 text-base md:text-lg mb-4 font-semibold">
            Se está manipulando este contenido
          </p>
          <p className="text-gray-600 text-sm md:text-base mb-4">
            Se ha detectado una modificación no autorizada en la información mostrada.
          </p>
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm font-semibold">
              ⚠️ Este perfil NO es válido
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-xs">
              Por seguridad, recargue la página desde el código QR original.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si se detectan DevTools abiertos, mostrar pantalla de bloqueo
  if (devToolsOpen && empleado) {
    return (
      <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-red-600 text-2xl md:text-3xl font-bold mb-4">
            ACCESO BLOQUEADO
          </h1>
          <p className="text-gray-700 text-base md:text-lg mb-4">
            Se ha detectado un intento de manipulación del perfil.
          </p>
          <p className="text-gray-600 text-sm md:text-base">
            Por razones de seguridad, este perfil ha sido bloqueado.
          </p>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-xs">
              Si necesita acceder, cierre las herramientas de desarrollador y recargue la página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Vista de directorio individual
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ef4444] to-[#b91c1c] flex items-center justify-center p-2 xs:p-3 md:p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-4 xs:p-5 md:p-10 text-center">
        {/* Logo */}
        <div className="w-20 h-20 xs:w-24 xs:h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mx-auto mb-4 xs:mb-5 md:mb-8 shadow-lg overflow-hidden bg-white">
          <img
            src={logoImg}
            alt="The Money Center Logo"
            className="w-full h-full object-contain p-1"
          />
        </div>

        {/* Título */}
        <h1 className="text-gray-800 text-xl xs:text-2xl md:text-4xl font-bold mb-1 md:mb-2">
          The Money Center
        </h1>
        <p className="text-gray-600 text-xs xs:text-sm md:text-lg mb-4 xs:mb-5 md:mb-8">
          Directorio de Empleados
        </p>

        {/* Estado: Loading */}
        {loadingState === 'loading' && (
          <div className="py-5 xs:py-6 md:py-8">
            <div className="w-10 h-10 xs:w-12 xs:h-12 md:w-16 md:h-16 border-3 xs:border-4 md:border-8 border-gray-200 border-t-[#ef4444] rounded-full animate-spin mx-auto mb-2 xs:mb-3 md:mb-4"></div>
            <p className="text-gray-600 text-xs xs:text-sm md:text-base">Cargando información...</p>
          </div>
        )}

        {/* Estado: Error */}
        {loadingState === 'error' && (
          <div className="bg-red-50 rounded-2xl p-3 xs:p-4 md:p-6 mt-2 xs:mt-3 md:mt-5">
            <div className="text-3xl xs:text-4xl md:text-6xl mb-2 md:mb-3">⚠️</div>
            <h2 className="text-red-600 text-base xs:text-lg md:text-2xl font-bold mb-2">
              Error al cargar
            </h2>
            <p className="text-red-700 text-[10px] xs:text-xs md:text-base mb-2 xs:mb-3 md:mb-4">{errorMessage}</p>
            <a
              href="."
              className="inline-block px-3 py-1.5 xs:px-4 xs:py-2 md:px-6 md:py-2 bg-[#ef4444] text-white text-[10px] xs:text-xs md:text-base rounded-lg hover:bg-[#dc2626] transition-colors active:bg-[#b91c1c]"
            >
              Ver todos los empleados
            </a>
          </div>
        )}

        {/* Estado: Success */}
        {loadingState === 'success' && empleado && (
          <div>
            {/* QR Code del empleado */}
            <div className="flex flex-col items-center mb-3 xs:mb-4 md:mb-6">
              <img
                src={getQRPath(empleado.nombre)}
                alt={`QR de ${empleado.nombre}`}
                className="w-32 h-32 xs:w-40 xs:h-40 md:w-48 md:h-48 object-contain border-2 border-gray-200 rounded-xl p-2 bg-white mb-2 xs:mb-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <button
                onClick={() => downloadQR(empleado.nombre)}
                className="px-3 py-1.5 xs:px-4 xs:py-2 bg-[#ef4444] text-white text-[10px] xs:text-xs md:text-sm rounded-lg hover:bg-[#dc2626] transition-colors active:bg-[#b91c1c] flex items-center gap-1.5 xs:gap-2"
              >
                <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar QR
              </button>
            </div>

            {/* Nombre del empleado */}
            <div className="text-[#ef4444] text-base xs:text-lg md:text-3xl font-bold mb-2 xs:mb-3 md:mb-6 leading-tight">
              {empleado.nombre}
            </div>

            {/* Tarjeta de información */}
            <div className="bg-gray-50 rounded-2xl p-2 xs:p-3 md:p-6 space-y-1.5 xs:space-y-2 md:space-y-4">
              <div className="flex flex-col items-center text-center py-1.5 xs:py-2 md:py-4 border-b border-gray-200">
                <span className="text-gray-600 text-[10px] xs:text-xs md:text-sm font-semibold uppercase tracking-wide mb-0.5">
                  Puesto
                </span>
                <span className="text-gray-800 text-xs xs:text-sm md:text-xl font-medium">
                  {empleado.puesto}
                </span>
              </div>

              <div className="flex flex-col items-center text-center py-1.5 xs:py-2 md:py-4 border-b border-gray-200">
                <span className="text-gray-600 text-[10px] xs:text-xs md:text-sm font-semibold uppercase tracking-wide mb-0.5">
                  Gerencia
                </span>
                <span className="text-gray-800 text-xs xs:text-sm md:text-xl font-medium break-words">
                  {empleado.gerencia}
                </span>
              </div>

              <div className="flex flex-col items-center text-center py-1.5 xs:py-2 md:py-4">
                <span className="text-gray-600 text-[10px] xs:text-xs md:text-sm font-semibold uppercase tracking-wide mb-0.5">
                  Celular
                </span>
                <a
                  href={`tel:${empleado.celular}`}
                  className="text-[#ef4444] text-xs xs:text-sm md:text-xl font-medium hover:underline active:text-[#b91c1c]"
                >
                  {empleado.celular}
                </a>
              </div>
            </div>

            {/* Capa 2: Timestamp Dinámico */}
            <div className="w-full border-t-2 border-gray-200 mt-4 pt-3">
              <div className="text-center">
                <p className="text-gray-500 text-[10px] xs:text-xs uppercase tracking-wide mb-1">
                  Verificado
                </p>
                <p className="text-gray-800 text-xs xs:text-sm md:text-base font-mono font-semibold">
                  {formatDateTime(currentTime)}
                </p>
              </div>
            </div>

            {/* Capa 3: Indicador de Integridad - Solo se muestra si es válido */}
            {isIntegrityValid && (
              <div className="w-full mt-3 px-3 py-2 rounded-lg bg-green-50">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">✓</span>
                  <span className="text-xs xs:text-sm font-semibold text-green-700">
                    Perfil Válido
                  </span>
                </div>
                <p className="text-center text-[10px] xs:text-xs text-green-600 mt-1">
                  Estado: VERIFICADO
                </p>
                <p className="text-center text-[10px] xs:text-xs text-green-700 mt-1 font-semibold">
                  Vigencia: 2026-2027
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
