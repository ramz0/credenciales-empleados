import { useState } from 'react';
import type { CredencialProps } from '../types/credencial';

export default function Credencial({ empleado, logoUrl, nombreEmpresa }: CredencialProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-[#E31E24] flex flex-col items-center px-4 py-8 animate-fadeIn">
      {/* Header */}
      <header className="w-full text-center mb-8">
        <h1 className="text-white text-xl font-bold tracking-wide">
          {nombreEmpresa}
        </h1>
      </header>

      {/* Card Principal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] px-6 py-8 flex flex-col items-center">

        {/* Logo Circular */}
        <div className="relative mb-8">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="w-48 h-48 md:w-52 md:h-52 rounded-full bg-gray-200 animate-pulse shadow-lg shadow-red-200"></div>
          )}

          {/* Imagen del Logo */}
          <img
            src={logoUrl}
            alt="Logo"
            className={`w-48 h-48 md:w-52 md:h-52 rounded-full object-cover shadow-lg shadow-red-200 transition-all duration-300 hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute top-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Texto Principal */}
        <div className="text-center mb-16">
          {/* Título/Puesto */}
          <h2 className="text-black text-2xl font-bold mb-3 leading-tight">
            {empleado.puesto}
          </h2>

          {/* Años de Vigencia */}
          <p className="text-[#9CA3AF] text-lg tracking-wider">
            {empleado.vigencia.inicio}-{empleado.vigencia.fin}
          </p>
        </div>

        {/* Botón de Menú (Esquina inferior derecha) */}
        <button
          className="absolute bottom-6 right-6 w-12 h-12 bg-[#E31E24] rounded-lg flex items-center justify-center text-white text-2xl font-bold hover:bg-[#C91920] transition-colors duration-200 shadow-md"
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
