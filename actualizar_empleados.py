#!/usr/bin/env python3
"""
Script para actualizar empleados.json desde Excel maestro.
The Money Center - Directorio de Empleados

Este script:
1. Lee el Excel maestro (con columna UUID)
2. Si UUID existe → usa ese UUID (empleado existente, preserva QR)
3. Si UUID vacío → genera UUID nuevo (empleado nuevo)
4. Genera empleados.json actualizado
"""

import json
import openpyxl
import sys
import uuid
from pathlib import Path


def actualizar_empleados(excel_file, json_file='empleados.json'):
    """
    Actualiza empleados.json desde Excel maestro preservando UUIDs.

    Args:
        excel_file: Ruta al archivo Excel maestro
        json_file: Ruta al archivo JSON de salida (default: empleados.json)
    """
    try:
        print("=" * 70)
        print("  ACTUALIZADOR DE EMPLEADOS - THE MONEY CENTER")
        print("=" * 70)
        print()
        print(f"📂 Leyendo Excel maestro: {excel_file}")

        # Cargar el archivo Excel
        workbook = openpyxl.load_workbook(excel_file)
        sheet = workbook.active

        empleados = []
        nuevos = 0
        actualizados = 0
        errores = 0

        # Iterar desde la fila 2 (la fila 1 es encabezado)
        # Columnas: A=UUID, B=NOMBRE, C=PUESTO, D=GERENCIA, E=CELULAR
        for idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
            try:
                # Leer columnas (índice 0-based)
                empleado_uuid = row[0] if len(row) > 0 and row[0] else ""
                nombre = row[1] if len(row) > 1 and row[1] else ""
                puesto = row[2] if len(row) > 2 and row[2] else ""
                gerencia = row[3] if len(row) > 3 and row[3] else ""
                celular = row[4] if len(row) > 4 and row[4] else ""

                # Saltar filas vacías
                if not nombre:
                    continue

                # Limpiar y formatear datos
                nombre = str(nombre).strip().upper()
                puesto = str(puesto).strip() if puesto else "Asesor"
                gerencia = str(gerencia).strip() if gerencia else ""
                celular = str(celular).strip() if celular else ""

                # Si UUID está vacío, generar uno nuevo (empleado nuevo)
                if not empleado_uuid or empleado_uuid.strip() == "":
                    empleado_uuid = str(uuid.uuid4())
                    nuevos += 1
                else:
                    # UUID existe, es empleado existente (actualización)
                    empleado_uuid = str(empleado_uuid).strip()
                    actualizados += 1

                # Crear objeto empleado
                empleado = {
                    "id": empleado_uuid,
                    "nombre": nombre,
                    "puesto": puesto,
                    "gerencia": gerencia,
                    "celular": celular
                }

                empleados.append(empleado)

            except Exception as e:
                errores += 1
                print(f"⚠️  Error en fila {idx}: {str(e)}")
                continue

        # Guardar a JSON
        print(f"\n💾 Guardando {len(empleados)} empleados en {json_file}")

        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(empleados, f, ensure_ascii=False, indent=2)

        # Resumen
        print("\n✅ Actualización completada exitosamente!")
        print("=" * 70)
        print(f"📊 RESUMEN:")
        print(f"   • Total empleados:     {len(empleados)}")
        print(f"   • Empleados nuevos:    {nuevos}")
        print(f"   • Empleados actualizados: {actualizados}")
        if errores > 0:
            print(f"   ⚠️  Filas con error:    {errores}")
        print(f"\n📁 Archivo generado: {json_file}")
        print("=" * 70)
        print()

        if nuevos > 0:
            print(f"🔔 IMPORTANTE:")
            print(f"   Se agregaron {nuevos} empleados nuevos")
            print(f"   Debes generar sus códigos QR:")
            print(f"   → python generar_qrs_faltantes.py")
            print()

        return True

    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo '{excel_file}'")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Función principal del script."""
    print()

    # Verificar argumentos
    if len(sys.argv) < 2:
        print("Uso: python actualizar_empleados.py <archivo_excel_maestro.xlsx> [archivo_salida.json]")
        print()
        print("Ejemplo:")
        print("  python actualizar_empleados.py empleados_maestro.xlsx")
        print("  python actualizar_empleados.py empleados_maestro.xlsx empleados.json")
        print()
        print("IMPORTANTE:")
        print("  • Si UUID está vacío → Genera UUID nuevo (empleado nuevo)")
        print("  • Si UUID existe → Preserva UUID (actualización, QR sigue funcionando)")
        print()
        sys.exit(1)

    excel_file = sys.argv[1]
    json_file = sys.argv[2] if len(sys.argv) > 2 else 'empleados.json'

    # Verificar que el archivo existe
    if not Path(excel_file).exists():
        print(f"❌ Error: El archivo '{excel_file}' no existe")
        sys.exit(1)

    # Ejecutar conversión
    success = actualizar_empleados(excel_file, json_file)

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
