#!/usr/bin/env python3
"""
Script para generar códigos QR solo para empleados nuevos.
The Money Center - Directorio de Empleados

Este script:
1. Lee empleados.json
2. Verifica qué QR codes ya existen
3. Genera solo los QR codes faltantes
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


def generar_qrs_faltantes(json_file='empleados.json', base_url=None, output_dir='qr_codes'):
    """
    Genera códigos QR solo para empleados que no tienen QR code.

    Args:
        json_file: Ruta al archivo JSON de empleados
        base_url: URL base (ej: https://usuario.github.io/credenciales-empleados)
        output_dir: Directorio donde guardar las imágenes
    """
    try:
        print("=" * 70)
        print("  GENERADOR INCREMENTAL DE CÓDIGOS QR - THE MONEY CENTER")
        print("=" * 70)
        print()
        print(f"📂 Leyendo archivo: {json_file}")

        # Leer el archivo JSON
        with open(json_file, 'r', encoding='utf-8') as f:
            empleados = json.load(f)

        if not empleados:
            print("⚠️  El archivo JSON está vacío")
            return False

        # Si no se proporciona base_url, usar la por defecto
        if not base_url:
            base_url = "https://ramz0.github.io/credenciales-empleados"
            print(f"ℹ️  Usando URL base: {base_url}")

        # Crear directorio de salida si no existe
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)

        print(f"📁 Directorio de salida: {output_dir}/")
        print(f"\n🔍 Verificando QR codes existentes...\n")

        # Verificar qué QR codes ya existen
        empleados_faltantes = []
        empleados_existentes = []

        for empleado in empleados:
            nombre = empleado.get('nombre', '')
            if not nombre:
                continue

            filename = sanitize_filename(nombre)
            filepath = output_path / f"{filename}.png"

            if filepath.exists():
                empleados_existentes.append(nombre)
            else:
                empleados_faltantes.append(empleado)

        # Resumen de verificación
        print(f"📊 ESTADO ACTUAL:")
        print(f"   • Total empleados:     {len(empleados)}")
        print(f"   • QR existentes:       {len(empleados_existentes)}")
        print(f"   • QR faltantes:        {len(empleados_faltantes)}")
        print()

        if len(empleados_faltantes) == 0:
            print("✅ Todos los QR codes ya están generados")
            print(f"   No hay nada que hacer")
            return True

        # Generar QR codes faltantes
        print(f"🔨 Generando {len(empleados_faltantes)} códigos QR nuevos...\n")

        exitos = 0
        errores = 0

        for idx, empleado in enumerate(empleados_faltantes, 1):
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
                print(f"✅ [{idx}/{len(empleados_faltantes)}] {nombre}")

            except Exception as e:
                errores += 1
                print(f"❌ [{idx}/{len(empleados_faltantes)}] Error con {nombre}: {str(e)}")
                continue

        # Resumen final
        print(f"\n{'='*70}")
        print(f"✅ Generación completada!")
        print(f"{'='*70}")
        print(f"📊 RESUMEN:")
        print(f"   • QR codes nuevos generados: {exitos}")
        if errores > 0:
            print(f"   ⚠️  Errores: {errores}")
        print(f"   • Total QR codes ahora: {len(empleados_existentes) + exitos}")
        print(f"📁 Ubicación: {output_path.absolute()}/")
        print(f"{'='*70}\n")

        # Instrucciones
        if exitos > 0:
            print("📋 PRÓXIMOS PASOS:")
            print(f"   1. Verifica los {exitos} QR codes nuevos en: {output_dir}/")
            print(f"   2. Copia los QR al proyecto web:")
            print(f"      cp -r {output_dir}/* public/qr_codes/")
            print(f"   3. Actualiza el JSON en el proyecto:")
            print(f"      cp {json_file} public/empleados.json")
            print(f"   4. Build y deploy:")
            print(f"      npm run build")
            print(f"      npm run deploy")

        return True

    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo '{json_file}'")
        return False
    except json.JSONDecodeError:
        print(f"❌ Error: El archivo '{json_file}' no es un JSON válido")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Función principal del script."""
    # Parámetros por defecto
    json_file = 'empleados.json'
    output_dir = 'qr_codes'
    base_url = None

    # Procesar argumentos de línea de comandos
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            print("Uso: python generar_qrs_faltantes.py [archivo_json] [output_dir] [base_url]")
            print()
            print("Parámetros:")
            print("  archivo_json : Archivo JSON con empleados (default: empleados.json)")
            print("  output_dir   : Carpeta para guardar QR (default: qr_codes)")
            print("  base_url     : URL base de GitHub Pages")
            print()
            print("Ejemplos:")
            print("  python generar_qrs_faltantes.py")
            print("  python generar_qrs_faltantes.py empleados.json")
            print("  python generar_qrs_faltantes.py empleados.json qr_codes")
            print("  python generar_qrs_faltantes.py empleados.json qr_codes https://usuario.github.io/repo")
            print()
            print("Este script:")
            print("  ✓ Solo genera QR codes para empleados nuevos")
            print("  ✓ No regenera QR codes existentes")
            print("  ✓ Preserva los QR codes actuales")
            sys.exit(0)

        json_file = sys.argv[1]

    if len(sys.argv) > 2:
        output_dir = sys.argv[2]

    if len(sys.argv) > 3:
        base_url = sys.argv[3]

    # Verificar que el archivo JSON existe
    if not Path(json_file).exists():
        print(f"❌ Error: El archivo '{json_file}' no existe")
        sys.exit(1)

    # Ejecutar generación
    success = generar_qrs_faltantes(json_file, base_url, output_dir)

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
