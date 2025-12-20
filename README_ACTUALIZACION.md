# Guía de Actualización de Empleados

**Sistema de Gestión de Empleados con QR Codes**
The Money Center - Directorio de Empleados

## 📋 Índice

1. [Visión General](#visión-general)
2. [Archivos Importantes](#archivos-importantes)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Casos de Uso](#casos-de-uso)
5. [Resolución de Problemas](#resolución-de-problemas)

---

## 🎯 Visión General

Este sistema permite gestionar empleados manteniendo **UUIDs estables** para preservar las URLs de los códigos QR ya generados e impresos.

### El Problema que Resuelve

❌ **PROBLEMA:** Si regeneras todo el JSON, los UUIDs cambian → Los QR codes impresos dejan de funcionar

✅ **SOLUCIÓN:** Excel maestro con columna UUID que preserva los IDs existentes

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────┐
│         empleados_maestro.xlsx                      │
│  (Excel con todos los empleados + columna UUID)     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
         actualizar_empleados.py
                   │
                   ├─ Preserva UUIDs existentes
                   ├─ Genera UUIDs para nuevos
                   │
                   ▼
         empleados.json (actualizado)
                   │
                   ▼
       generar_qrs_faltantes.py
                   │
                   ├─ Detecta QR faltantes
                   ├─ Genera solo los nuevos
                   │
                   ▼
         qr_codes/ (solo los nuevos)
```

---

## 📁 Archivos Importantes

### Scripts Python

| Archivo | Descripción |
|---------|-------------|
| `crear_excel_maestro.py` | Crea Excel maestro inicial combinando JSON + Excel gerentes |
| `actualizar_empleados.py` | Actualiza empleados.json desde Excel maestro (preserva UUIDs) |
| `generar_qrs_faltantes.py` | Genera solo QR codes para empleados nuevos |
| `generar_qrs_imagenes.py` | Genera TODOS los QR codes (usar solo la primera vez) |

### Archivos de Datos

| Archivo | Descripción |
|---------|-------------|
| `empleados_maestro.xlsx` | Excel maestro con TODOS los empleados (fuente de verdad) |
| `empleados.json` | JSON con empleados (usado por la app web) |
| `public/empleados.json` | Copia del JSON en el directorio público |
| `qr_codes/` | Directorio con imágenes PNG de códigos QR |
| `public/qr_codes/` | Copia de QR codes en directorio público |

---

## 🔄 Flujo de Trabajo

### ✅ Primera Configuración (YA REALIZADA)

```bash
# 1. Crear Excel maestro inicial
source venv/bin/activate
python crear_excel_maestro.py ~/Descargas/"GERENCIAS Y DR.xlsx"

# Resultado: empleados_maestro.xlsx con 208 empleados (183 asesores + 25 gerentes)
```

### 📝 Agregar Nuevos Empleados

1. **Abre `empleados_maestro.xlsx`**
2. **Agrega nueva fila al final:**
   - UUID: **(DEJAR VACÍO)**
   - NOMBRE: Nombre completo en MAYÚSCULAS
   - PUESTO: Asesor o Gerente
   - GERENCIA: THE MONEY CENTER X
   - CELULAR: Número de teléfono

3. **Guarda el Excel**

4. **Ejecuta el script de actualización:**
   ```bash
   source venv/bin/activate
   python actualizar_empleados.py empleados_maestro.xlsx
   ```

   Salida esperada:
   ```
   ✅ Actualización completada exitosamente!
   📊 RESUMEN:
      • Total empleados:     209
      • Empleados nuevos:    1
      • Empleados actualizados: 208

   🔔 IMPORTANTE:
      Se agregaron 1 empleados nuevos
      Debes generar sus códigos QR:
      → python generar_qrs_faltantes.py
   ```

5. **Genera QR codes para los nuevos empleados:**
   ```bash
   python generar_qrs_faltantes.py
   ```

   Salida esperada:
   ```
   📊 ESTADO ACTUAL:
      • Total empleados:     209
      • QR existentes:       208
      • QR faltantes:        1

   🔨 Generando 1 códigos QR nuevos...
   ✅ [1/1] JUAN PÉREZ GARCÍA
   ```

6. **Copia los archivos al proyecto:**
   ```bash
   cp empleados.json public/empleados.json
   cp -r qr_codes/* public/qr_codes/
   ```

7. **Build y deploy:**
   ```bash
   npm run build
   npm run deploy
   ```

### ✏️ Actualizar Datos de Empleado Existente

1. **Abre `empleados_maestro.xlsx`**
2. **Busca al empleado por nombre**
3. **Modifica los datos que necesites (NUNCA modifiques la columna UUID)**
4. **Guarda el Excel**
5. **Ejecuta:**
   ```bash
   source venv/bin/activate
   python actualizar_empleados.py empleados_maestro.xlsx
   cp empleados.json public/empleados.json
   npm run build
   npm run deploy
   ```

**IMPORTANTE:** No necesitas regenerar el QR code, porque el UUID no cambió.

### 🗑️ Eliminar Empleado

1. **Abre `empleados_maestro.xlsx`**
2. **Elimina la fila completa del empleado**
3. **Guarda el Excel**
4. **Ejecuta:**
   ```bash
   source venv/bin/activate
   python actualizar_empleados.py empleados_maestro.xlsx
   cp empleados.json public/empleados.json
   npm run build
   npm run deploy
   ```

**Nota:** El QR code del empleado eliminado seguirá existiendo pero mostrará error al escanearlo.

---

## 💡 Casos de Uso

### Caso 1: Agregar 10 Empleados Nuevos

```bash
# 1. Edita empleados_maestro.xlsx y agrega 10 filas con UUID vacío
# 2. Ejecuta:
source venv/bin/activate
python actualizar_empleados.py empleados_maestro.xlsx
python generar_qrs_faltantes.py
cp empleados.json public/empleados.json
cp -r qr_codes/* public/qr_codes/
npm run build
npm run deploy
```

### Caso 2: Actualizar Teléfonos de 5 Empleados

```bash
# 1. Edita empleados_maestro.xlsx y cambia los teléfonos (NO toques UUID)
# 2. Ejecuta:
source venv/bin/activate
python actualizar_empleados.py empleados_maestro.xlsx
cp empleados.json public/empleados.json
npm run build
npm run deploy
# NO necesitas regenerar QR codes
```

### Caso 3: Combinar Agregar + Actualizar + Eliminar

```bash
# 1. Edita empleados_maestro.xlsx:
#    - Agrega 3 empleados nuevos (UUID vacío)
#    - Actualiza 2 empleados existentes (mantén UUID)
#    - Elimina 1 empleado (borra fila completa)
# 2. Ejecuta:
source venv/bin/activate
python actualizar_empleados.py empleados_maestro.xlsx
python generar_qrs_faltantes.py
cp empleados.json public/empleados.json
cp -r qr_codes/* public/qr_codes/
npm run build
npm run deploy
```

---

## 🚨 Resolución de Problemas

### El script dice "0 empleados nuevos" pero agregué empleados

**Problema:** Los empleados que agregaste ya tienen UUID en el Excel

**Solución:** Elimina el UUID de la columna A para esos empleados y vuelve a ejecutar

---

### Se generaron QR codes para todos, no solo los nuevos

**Problema:** Usaste `generar_qrs_imagenes.py` en lugar de `generar_qrs_faltantes.py`

**Solución:** Usa `generar_qrs_faltantes.py` que solo genera los faltantes

---

### Los QR codes impresos dejaron de funcionar

**Problema:** Cambiaste o eliminaste los UUIDs en el Excel maestro

**Solución:**
1. No modifiques NUNCA la columna UUID del Excel
2. Si ya lo hiciste, necesitas restaurar el Excel desde un backup
3. Como último recurso: reimprimir TODOS los QR codes

---

### Error: "No se encontró el archivo empleados_maestro.xlsx"

**Problema:** Estás ejecutando el script desde un directorio incorrecto

**Solución:**
```bash
cd /home/ramz/Projects/generador_QR/directorio-empleados-react
source venv/bin/activate
python actualizar_empleados.py empleados_maestro.xlsx
```

---

### Un empleado aparece duplicado

**Problema:** Agregaste una fila nueva en lugar de editar la existente

**Solución:**
1. Abre `empleados_maestro.xlsx`
2. Elimina la fila duplicada (la que tenga UUID vacío)
3. Edita la fila original
4. Guarda y ejecuta `python actualizar_empleados.py empleados_maestro.xlsx`

---

## 📊 Estructura del Excel Maestro

### Columnas

| Columna | Nombre | Tipo | Descripción |
|---------|--------|------|-------------|
| A | UUID | Texto | ID único (NO MODIFICAR para empleados existentes) |
| B | NOMBRE | Texto | Nombre completo en MAYÚSCULAS |
| C | PUESTO | Texto | "Asesor" o "Gerente" |
| D | GERENCIA | Texto | THE MONEY CENTER X |
| E | CELULAR | Texto | Número de teléfono |

### Ejemplo de Filas

| UUID | NOMBRE | PUESTO | GERENCIA | CELULAR |
|------|--------|--------|----------|---------|
| 6ec40da2-3961-438a-ba77-61d28bcbfe25 | BRENDA BERMEO MENDOZA | Asesor | THE MONEY CENTER 1 | 55 10 12 51 80 |
| c8d8592d-6f5c-4def-af23-fad8280ad107 | EDUARDO GONZALEZ DOMINGUEZ | Asesor | THE MONEY CENTER 1 | 55 28 88 50 02 |
| *(vacío)* | NUEVO EMPLEADO | Asesor | THE MONEY CENTER 2 | 55 1234 5678 |

---

## 🔐 Reglas de Oro

1. ✅ **NUNCA modifiques el UUID de un empleado existente**
2. ✅ **SIEMPRE deja el UUID vacío para empleados nuevos**
3. ✅ **SIEMPRE haz backup del Excel maestro antes de cambios grandes**
4. ✅ **SIEMPRE usa `generar_qrs_faltantes.py` para QR incrementales**
5. ✅ **SIEMPRE copia los archivos a `public/` antes de hacer build**

---

## 🎓 Comandos Rápidos

```bash
# Activar entorno virtual
source venv/bin/activate

# Actualizar empleados desde Excel
python actualizar_empleados.py empleados_maestro.xlsx

# Generar QR codes faltantes
python generar_qrs_faltantes.py

# Copiar archivos al proyecto
cp empleados.json public/empleados.json
cp -r qr_codes/* public/qr_codes/

# Build y deploy
npm run build
npm run deploy
```

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que estés en el directorio correcto
2. Verifica que el entorno virtual esté activado
3. Revisa que el Excel maestro esté bien formado
4. Haz backup antes de hacer cambios
5. Prueba en un archivo JSON temporal primero

---

**The Money Center** - Sistema de Credenciales Digitales
