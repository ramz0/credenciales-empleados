# Credenciales Empleados - The Money Center

Sistema de credenciales digitales para empleados con códigos QR, construido con React + Vite + TypeScript + Tailwind CSS.

## Tecnologías

- ⚛️ React 19
- ⚡ Vite
- 📘 TypeScript
- 🎨 Tailwind CSS 4
- 📦 GitHub Pages (hosting gratuito)

## Características

- Credencial digital con diseño moderno
- Vista de directorio de empleados
- Colores corporativos rojos (#ef4444 → #b91c1c)
- 183 empleados cargados desde JSON
- Responsive mobile-first
- Compatible con códigos QR

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Visita: `http://localhost:5173/credenciales-empleados/?id=001`

## Build

```bash
npm run build
```

## Deploy a GitHub Pages

```bash
npm run deploy
```

Tu sitio estará en: `https://TU_USUARIO.github.io/credenciales-empleados/`

## Uso

### Ver empleado por ID

```
https://TU_USUARIO.github.io/credenciales-empleados/?id=001
```

Los IDs van del 001 al 183.

### Vistas disponibles

1. **Directorio** (por defecto): Muestra información completa del empleado
   ```
   ?id=001
   ```

2. **Credencial digital**: Vista de credencial corporativa
   ```
   ?id=001&view=credencial
   ```

## Actualizar empleados

1. Edita el archivo Excel con los datos actualizados
2. Ejecuta el script de conversión:
   ```bash
   source venv/bin/activate
   python excel_to_json.py ~/ruta/al/archivo.xlsx empleados.json
   cp empleados.json public/empleados.json
   ```
3. Commit y deploy:
   ```bash
   git add public/empleados.json
   git commit -m "Actualizar empleados"
   git push
   npm run deploy
   ```

## Estructura del proyecto

```
├── src/
│   ├── App.tsx                    # Componente principal
│   ├── components/
│   │   └── Credencial.tsx         # Vista de credencial
│   ├── types/
│   │   ├── empleado.ts           # Tipos de empleado
│   │   └── credencial.ts         # Tipos de credencial
│   └── index.css                  # Estilos globales
├── public/
│   └── empleados.json             # Base de datos (183 empleados)
├── excel_to_json.py               # Script conversión Excel→JSON
├── generar_qrs.py                 # Script generación URLs
└── vite.config.ts                 # Configuración Vite
```

## Scripts Python

### Convertir Excel a JSON

```bash
python excel_to_json.py archivo.xlsx empleados.json
```

### Generar URLs para QR

```bash
python generar_qrs.py empleados.json urls.txt https://usuario.github.io/credenciales-empleados
```

## Colores

- Rojo principal: `#ef4444` (red-500)
- Rojo oscuro: `#b91c1c` (red-700)
- Credencial: `#E31E24`

## Requisitos

- Node.js 18+
- npm
- Python 3.6+ (para scripts de conversión)
- Git

---

**The Money Center** - Sistema de Credenciales Digitales
