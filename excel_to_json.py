#!/usr/bin/env python3
"""
Script para convertir archivo Excel de empleados a formato JSON.
The Money Center - Directorio de Empleados

Estructura del Excel:
- Columna D: GERENCIA
- Columna E: NOMBRE DEL ASESOR
- Columna F: NO DE CELULAR
- Fila 1: encabezados
- Datos desde fila 2
"""

import json
import openpyxl
import sys
import uuid
from pathlib import Path


def excel_to_json(excel_file, json_file='empleados.json'):
    """
    Convierte un archivo Excel de empleados a formato JSON.

    Args:
        excel_file: Ruta al archivo Excel
        json_file: Ruta al archivo JSON de salida (default: empleados.json)
    """
    try:
        print(f"📂 Abriendo archivo Excel: {excel_file}")

        # Cargar el archivo Excel
        workbook = openpyxl.load_workbook(excel_file)
        sheet = workbook.active

        empleados = []
        filas_procesadas = 0
        filas_con_error = 0

        # Iterar desde la fila 3 (la fila 1 y 2 son encabezados)
        for idx, row in enumerate(sheet.iter_rows(min_row=3, values_only=True), start=3):
            try:
                # Columnas: D=3, E=4, F=5 (índice 0-based)
                gerencia = row[3] if len(row) > 3 and row[3] else ""
                nombre = row[4] if len(row) > 4 and row[4] else ""
                celular = row[5] if len(row) > 5 and row[5] else ""

                # Saltar filas vacías
                if not nombre or not gerencia:
                    continue

                # Generar UUID único para cada empleado
                empleado_id = str(uuid.uuid4())

                # Limpiar y formatear datos
                nombre = str(nombre).strip().upper()
                gerencia = str(gerencia).strip()
                celular = str(celular).strip()

                # Crear objeto empleado
                empleado = {
                    "id": empleado_id,
                    "nombre": nombre,
                    "puesto": "Asesor",  # Por defecto, ajustar si es necesario
                    "gerencia": gerencia,
                    "celular": celular
                }

                empleados.append(empleado)
                filas_procesadas += 1

            except Exception as e:
                filas_con_error += 1
                print(f"⚠️  Error en fila {idx}: {str(e)}")
                continue

        # Guardar a JSON
        print(f"\n💾 Guardando {len(empleados)} empleados en {json_file}")

        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(empleados, f, ensure_ascii=False, indent=2)

        # Resumen
        print("\n✅ Conversión completada exitosamente!")
        print(f"   📊 Total empleados procesados: {filas_procesadas}")
        if filas_con_error > 0:
            print(f"   ⚠️  Filas con error: {filas_con_error}")
        print(f"   📁 Archivo generado: {json_file}")

        return True

    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo '{excel_file}'")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        return False


def main():
    """Función principal del script."""
    print("=" * 60)
    print("  CONVERSOR EXCEL A JSON - THE MONEY CENTER")
    print("=" * 60)
    print()

    # Verificar argumentos
    if len(sys.argv) < 2:
        print("Uso: python excel_to_json.py <archivo_excel.xlsx> [archivo_salida.json]")
        print()
        print("Ejemplo:")
        print("  python excel_to_json.py empleados.xlsx")
        print("  python excel_to_json.py empleados.xlsx empleados.json")
        sys.exit(1)

    excel_file = sys.argv[1]
    json_file = sys.argv[2] if len(sys.argv) > 2 else 'empleados.json'

    # Verificar que el archivo existe
    if not Path(excel_file).exists():
        print(f"❌ Error: El archivo '{excel_file}' no existe")
        sys.exit(1)

    # Ejecutar conversión
    success = excel_to_json(excel_file, json_file)

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
