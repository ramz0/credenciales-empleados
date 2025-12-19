import { useState, useEffect, useRef } from 'react';
import type { CredencialProps } from '../types/credencial';

export default function Credencial({ empleado, logoUrl, nombreEmpresa }: CredencialProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isIntegrityValid, setIsIntegrityValid] = useState(true);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const originalDataRef = useRef(empleado.nombre + empleado.puesto);

  // Capa 2: Timestamp dinámico - se actualiza cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Capa 3: Detector de integridad - verifica modificaciones del DOM
  useEffect(() => {
    const checkIntegrity = () => {
      const currentData = empleado.nombre + empleado.puesto;
      if (currentData !== originalDataRef.current) {
        setIsIntegrityValid(false);
      }
    };
    const integrityTimer = setInterval(checkIntegrity, 2000);
    return () => clearInterval(integrityTimer);
  }, [empleado]);

  // Capa 4: Detector de DevTools
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        setDevToolsOpen(true);
      }
    };

    const devToolsTimer = setInterval(detectDevTools, 1000);
    window.addEventListener('resize', detectDevTools);

    return () => {
      clearInterval(devToolsTimer);
      window.removeEventListener('resize', detectDevTools);
    };
  }, []);

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

  // Si se detectan DevTools abiertos, mostrar pantalla de bloqueo
  if (devToolsOpen) {
    return (
      <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-red-600 text-2xl font-bold mb-4">
            ACCESO BLOQUEADO
          </h1>
          <p className="text-gray-700 mb-4">
            Se ha detectado un intento de manipulación de la credencial.
          </p>
          <p className="text-gray-600 text-sm">
            Por razones de seguridad, esta credencial ha sido bloqueada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E31E24] flex flex-col items-center px-2 xs:px-3 py-3 xs:py-4 md:py-8 animate-fadeIn">
      {/* Header */}
      <header className="w-full text-center mb-3 xs:mb-4 md:mb-8">
        <h1 className="text-white text-sm xs:text-base md:text-xl font-bold tracking-wide">
          {nombreEmpresa}
        </h1>
      </header>

      {/* Card Principal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] px-3 py-4 xs:px-4 xs:py-5 md:px-6 md:py-8 flex flex-col items-center">

        {/* Logo Circular */}
        <div className="relative mb-4 xs:mb-5 md:mb-8">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="w-32 h-32 xs:w-36 xs:h-36 md:w-52 md:h-52 rounded-full bg-gray-200 animate-pulse shadow-lg shadow-red-200"></div>
          )}

          {/* Imagen del Logo */}
          <img
            src={logoUrl}
            alt="Logo"
            className={`w-32 h-32 xs:w-36 xs:h-36 md:w-52 md:h-52 rounded-full object-cover shadow-lg shadow-red-200 transition-all duration-300 active:scale-105 md:hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute top-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Texto Principal */}
        <div className="text-center mb-4 xs:mb-6 md:mb-10">
          {/* Nombre del empleado */}
          <h2 className="text-black text-base xs:text-lg md:text-2xl font-bold mb-1 leading-tight px-2">
            {empleado.nombre}
          </h2>

          {/* Título/Puesto */}
          <p className="text-gray-700 text-sm xs:text-base md:text-xl mb-1.5 xs:mb-2 md:mb-3 px-2">
            {empleado.puesto}
          </p>

          {/* Años de Vigencia */}
          <p className="text-[#9CA3AF] text-xs xs:text-sm md:text-base tracking-wider">
            Vigencia: {empleado.vigencia.inicio}-{empleado.vigencia.fin}
          </p>
        </div>

        {/* Capa 2: Timestamp Dinámico */}
        <div className="w-full border-t border-gray-200 pt-3 mb-3">
          <div className="text-center">
            <p className="text-gray-500 text-[10px] xs:text-xs uppercase tracking-wide mb-1">
              Verificado
            </p>
            <p className="text-gray-800 text-xs xs:text-sm md:text-base font-mono font-semibold">
              {formatDateTime(currentTime)}
            </p>
          </div>
        </div>

        {/* Capa 3: Indicador de Integridad */}
        <div className={`w-full px-3 py-2 rounded-lg ${isIntegrityValid ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">
              {isIntegrityValid ? '✓' : '⚠️'}
            </span>
            <span className={`text-xs xs:text-sm font-semibold ${isIntegrityValid ? 'text-green-700' : 'text-red-700'}`}>
              {isIntegrityValid ? 'Credencial Válida' : 'POSIBLE MODIFICACIÓN'}
            </span>
          </div>
          {isIntegrityValid && (
            <p className="text-center text-[10px] xs:text-xs text-green-600 mt-1">
              Estado: VERIFICADA
            </p>
          )}
        </div>

        {/* Botón de Menú (Esquina inferior derecha) - Touch-friendly */}
        <button
          className="absolute bottom-2.5 right-2.5 xs:bottom-3 xs:right-3 md:bottom-6 md:right-6 w-10 h-10 xs:w-11 xs:h-11 md:w-12 md:h-12 bg-[#E31E24] rounded-lg flex items-center justify-center text-white text-lg xs:text-xl md:text-2xl font-bold active:bg-[#C91920] md:hover:bg-[#C91920] transition-colors duration-200 shadow-md"
          aria-label="Menú de opciones"
        >
          ⋮
        </button>

        {/* Línea Decorativa */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[60%] h-1 bg-[#D1D5DB] rounded-full"></div>
      </div>
    </div>
  );
}
