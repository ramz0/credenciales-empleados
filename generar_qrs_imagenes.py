#!/usr/bin/env python3
"""
Script para generar códigos QR como imágenes PNG.
The Money Center - Directorio de Empleados

Genera una imagen QR por cada empleado con su URL única.
"""

import json
import qrcode
import sys
from pathlib import Path
import re


def sanitize_filename(name):
    """
    Convierte un nombre en un nombre de archivo válido.
    Ejemplo: "JUAN PÉREZ GARCÍA" -> "JUAN_PEREZ_GARCIA"
    """
    # Eliminar acentos y caracteres especiales
    replacements = {
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Ñ': 'N', 'ñ': 'n',
        'Ü': 'U', 'ü': 'u',
    }

    for old, new in replacements.items():
        name = name.replace(old, new)

    # Reemplazar espacios por guiones bajos
    name = name.replace(' ', '_')

    # Eliminar cualquier caracter que no sea letra, número o guión bajo
    name = re.sub(r'[^A-Za-z0-9_]', '', name)

    return name


def generar_qrs(json_file='empleados.json', base_url=None, output_dir='qr_codes'):
    """
    Genera códigos QR como imágenes PNG para cada empleado.

    Args:
        json_file: Ruta al archivo JSON de empleados
        base_url: URL base (ej: https://usuario.github.io/credenciales-empleados)
        output_dir: Directorio donde guardar las imágenes
    """
    try:
        print(f"📂 Leyendo archivo: {json_file}")

        # Leer el archivo JSON
        with open(json_file, 'r', encoding='utf-8') as f:
            empleados = json.load(f)

        if not empleados:
            print("⚠️  El archivo JSON está vacío")
            return False

        # Si no se proporciona base_url, usar placeholder
        if not base_url:
            base_url = "https://ramz0.github.io/credenciales-empleados"
            print(f"ℹ️  Usando URL base: {base_url}")

        # Crear directorio de salida
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        print(f"📁 Creando directorio: {output_dir}/")

        print(f"\n🔨 Generando {len(empleados)} códigos QR...\n")

        # Generar QR para cada empleado
        exitos = 0
        errores = 0

        for idx, empleado in enumerate(empleados, 1):
            try:
                empleado_id = empleado.get('id', '')
                nombre = empleado.get('nombre', f'empleado_{idx}')

                # Construir URL
                url = f"{base_url}?id={empleado_id}"

                # Crear código QR
                qr = qrcode.QRCode(
                    version=1,  # Tamaño del QR (1 es el más pequeño)
                    error_correction=qrcode.constants.ERROR_CORRECT_H,  # Alta corrección de errores
                    box_size=10,  # Tamaño de cada "cuadrito"
                    border=4,  # Borde blanco alrededor
                )
                qr.add_data(url)
                qr.make(fit=True)

                # Crear imagen
                img = qr.make_image(fill_color="black", back_color="white")

                # Nombre del archivo
                filename = sanitize_filename(nombre)
                filepath = output_path / f"{filename}.png"

                # Guardar imagen
                img.save(filepath)

                exitos += 1
                print(f"✅ [{idx}/{len(empleados)}] {nombre}")

            except Exception as e:
                errores += 1
                print(f"❌ [{idx}/{len(empleados)}] Error con {nombre}: {str(e)}")
                continue

        # Resumen
        print(f"\n{'='*70}")
        print(f"✅ Generación completada!")
        print(f"{'='*70}")
        print(f"📊 Códigos QR generados: {exitos}")
        if errores > 0:
            print(f"⚠️  Errores: {errores}")
        print(f"📁 Ubicación: {output_path.absolute()}/")
        print(f"{'='*70}\n")

        # Instrucciones
        print("📋 Próximos pasos:")
        print(f"   1. Ve a la carpeta: {output_dir}/")
        print(f"   2. Encontrarás {exitos} imágenes PNG")
        print(f"   3. Cada imagen es un código QR listo para imprimir")
        print(f"   4. Puedes imprimirlas directamente o diseñar credenciales con ellas")

        return True

    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo '{json_file}'")
        return False
    except json.JSONDecodeError:
        print(f"❌ Error: El archivo '{json_file}' no es un JSON válido")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        return False


def main():
    """Función principal del script."""
    print("=" * 70)
    print("  GENERADOR DE CÓDIGOS QR - THE MONEY CENTER")
    print("=" * 70)
    print()

    # Parámetros por defecto
    json_file = 'empleados.json'
    output_dir = 'qr_codes'
    base_url = None

    # Procesar argumentos de línea de comandos
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            print("Uso: python generar_qrs_imagenes.py [archivo_json] [output_dir] [base_url]")
            print()
            print("Parámetros:")
            print("  archivo_json : Archivo JSON con empleados (default: empleados.json)")
            print("  output_dir   : Carpeta para guardar QR (default: qr_codes)")
            print("  base_url     : URL base de GitHub Pages")
            print()
            print("Ejemplos:")
            print("  python generar_qrs_imagenes.py")
            print("  python generar_qrs_imagenes.py empleados.json")
            print("  python generar_qrs_imagenes.py empleados.json qr_codes")
            print("  python generar_qrs_imagenes.py empleados.json qr_codes https://usuario.github.io/repo")
            sys.exit(0)

        json_file = sys.argv[1]

    if len(sys.argv) > 2:
        output_dir = sys.argv[2]

    if len(sys.argv) > 3:
        base_url = sys.argv[3]

    # Verificar que el archivo JSON existe
    if not Path(json_file).exists():
        print(f"❌ Error: El archivo '{json_file}' no existe")
        print(f"\nPrimero ejecuta: python excel_to_json.py <archivo_excel.xlsx>")
        sys.exit(1)

    # Ejecutar generación
    success = generar_qrs(json_file, base_url, output_dir)

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
