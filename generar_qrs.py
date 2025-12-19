#!/usr/bin/env python3
"""
Script para generar URLs de códigos QR para empleados.
The Money Center - Directorio de Empleados

Lee empleados.json y genera un archivo de texto con las URLs
para generar códigos QR en servicios externos como:
- https://www.qr-code-generator.com/
- https://www.qrcode-monkey.com/
"""

import json
import sys
from pathlib import Path


def generar_urls_qr(json_file='empleados.json', output_file='urls_qr.txt', base_url=None):
    """
    Genera un archivo de texto con URLs para cada empleado.

    Args:
        json_file: Ruta al archivo JSON de empleados
        output_file: Ruta al archivo de salida con las URLs
        base_url: URL base personalizada (ej: https://usuario.github.io/directorio-empleados)
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
            base_url = "https://USUARIO.github.io/directorio-empleados"
            print(f"⚠️  No se especificó URL base, usando: {base_url}")
            print("   Recuerda reemplazar 'USUARIO' con tu usuario de GitHub")

        print(f"\n🔗 Generando URLs para {len(empleados)} empleados...")

        # Generar URLs
        urls = []
        for empleado in empleados:
            empleado_id = empleado.get('id', '')
            nombre = empleado.get('nombre', '')
            url = f"{base_url}?id={empleado_id}"
            urls.append({
                'id': empleado_id,
                'nombre': nombre,
                'url': url
            })

        # Guardar en archivo de texto
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("=" * 70 + "\n")
            f.write("URLS PARA CÓDIGOS QR - THE MONEY CENTER\n")
            f.write("=" * 70 + "\n\n")
            f.write(f"Base URL: {base_url}\n")
            f.write(f"Total de empleados: {len(empleados)}\n")
            f.write(f"Fecha de generación: {Path(output_file).stat().st_mtime if Path(output_file).exists() else 'N/A'}\n")
            f.write("\n" + "=" * 70 + "\n\n")

            for item in urls:
                f.write(f"ID: {item['id']}\n")
                f.write(f"Nombre: {item['nombre']}\n")
                f.write(f"URL: {item['url']}\n")
                f.write("-" * 70 + "\n\n")

        # También generar un archivo con solo las URLs (útil para procesamiento en lote)
        urls_only_file = output_file.replace('.txt', '_solo_urls.txt')
        with open(urls_only_file, 'w', encoding='utf-8') as f:
            for item in urls:
                f.write(f"{item['url']}\n")

        print(f"\n✅ Archivos generados exitosamente!")
        print(f"   📁 Archivo con detalles: {output_file}")
        print(f"   📁 Archivo solo URLs: {urls_only_file}")
        print(f"\n📋 Próximos pasos:")
        print(f"   1. Abre {output_file} para ver todas las URLs")
        print(f"   2. Usa un generador de códigos QR en lote:")
        print(f"      - https://www.qr-code-generator.com/")
        print(f"      - https://www.qrcode-monkey.com/")
        print(f"   3. Genera los QR codes usando las URLs del archivo")

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
    print("  GENERADOR DE URLS PARA CÓDIGOS QR - THE MONEY CENTER")
    print("=" * 70)
    print()

    # Parámetros por defecto
    json_file = 'empleados.json'
    output_file = 'urls_qr.txt'
    base_url = None

    # Procesar argumentos de línea de comandos
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            print("Uso: python generar_qrs.py [archivo_json] [archivo_salida] [base_url]")
            print()
            print("Parámetros:")
            print("  archivo_json    : Archivo JSON con empleados (default: empleados.json)")
            print("  archivo_salida  : Archivo de texto de salida (default: urls_qr.txt)")
            print("  base_url        : URL base de GitHub Pages")
            print()
            print("Ejemplos:")
            print("  python generar_qrs.py")
            print("  python generar_qrs.py empleados.json")
            print("  python generar_qrs.py empleados.json urls.txt")
            print("  python generar_qrs.py empleados.json urls.txt https://usuario.github.io/repo")
            sys.exit(0)

        json_file = sys.argv[1]

    if len(sys.argv) > 2:
        output_file = sys.argv[2]

    if len(sys.argv) > 3:
        base_url = sys.argv[3]

    # Verificar que el archivo JSON existe
    if not Path(json_file).exists():
        print(f"❌ Error: El archivo '{json_file}' no existe")
        print(f"\nPrimero ejecuta: python excel_to_json.py <archivo_excel.xlsx>")
        sys.exit(1)

    # Ejecutar generación
    success = generar_urls_qr(json_file, output_file, base_url)

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
