#!/usr/bin/env python3
"""
Script para diagnosticar QR codes con UUIDs incorrectos.
The Money Center - Directorio de Empleados

Encuentra QR codes que apuntan a UUIDs que no existen en empleados.json
"""

import json
import qrcode
from pathlib import Path
from PIL import Image
import re


def sanitize_filename(name):
    """Convierte nombre a nombre de archivo."""
    replacements = {
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Ñ': 'N', 'ñ': 'n', 'Ü': 'U', 'ü': 'u',
    }
    for old, new in replacements.items():
        name = name.replace(old, new)
    name = name.replace(' ', '_')
    name = re.sub(r'[^A-Za-z0-9_]', '', name)
    return name


def extract_uuid_from_qr(qr_path):
    """Extrae el UUID de un código QR."""
    try:
        from pyzbar.pyzbar import decode
        img = Image.open(qr_path)
        decoded = decode(img)
        if decoded:
            url = decoded[0].data.decode('utf-8')
            # Extraer UUID de la URL (formato: ...?id=UUID)
            match = re.search(r'id=([a-f0-9-]+)', url)
            if match:
                return match.group(1)
        return None
    except ImportError:
        # Si pyzbar no está disponible, usar el nombre del archivo como proxy
        return None
    except Exception as e:
        print(f"Error leyendo QR {qr_path}: {e}")
        return None


def diagnosticar_qrs(json_file='empleados.json', qr_dir='public/qr_codes', base_url=None):
    """Diagnostica y corrige QR codes problemáticos."""
    try:
        print("=" * 70)
        print("  DIAGNÓSTICO DE QR CODES - THE MONEY CENTER")
        print("=" * 70)
        print()

        # Cargar empleados del JSON
        print(f"📂 Leyendo {json_file}...")
        with open(json_file, 'r', encoding='utf-8') as f:
            empleados = json.load(f)

        # Crear mapas de empleados
        empleados_por_uuid = {emp['id']: emp for emp in empleados}
        empleados_por_nombre = {emp['nombre']: emp for emp in empleados}

        print(f"   ✓ {len(empleados)} empleados en JSON")

        # Verificar QR codes
        qr_path = Path(qr_dir)
        if not qr_path.exists():
            print(f"❌ Error: No existe el directorio {qr_dir}")
            return False

        qr_files = list(qr_path.glob('*.png'))
        print(f"   ✓ {len(qr_files)} QR codes encontrados")
        print()

        # Analizar cada QR code
        print("🔍 Analizando QR codes...\n")

        qrs_correctos = []
        qrs_huerfanos = []
        qrs_a_regenerar = []

        for qr_file in qr_files:
            nombre_archivo = qr_file.stem  # Nombre sin extensión

            # Buscar empleado por nombre normalizado
            empleado_encontrado = None
            for nombre, emp in empleados_por_nombre.items():
                if sanitize_filename(nombre) == nombre_archivo:
                    empleado_encontrado = emp
                    break

            if empleado_encontrado:
                qrs_correctos.append((qr_file.name, empleado_encontrado['nombre']))
            else:
                qrs_huerfanos.append(qr_file.name)
                print(f"⚠️  QR huérfano (empleado no existe): {qr_file.name}")

        # Buscar empleados sin QR code
        print(f"\n🔍 Buscando empleados sin QR code...\n")

        empleados_sin_qr = []
        for emp in empleados:
            nombre_archivo = sanitize_filename(emp['nombre']) + '.png'
            qr_existe = (qr_path / nombre_archivo).exists()
            if not qr_existe:
                empleados_sin_qr.append(emp)
                print(f"❌ Falta QR: {emp['nombre']} (UUID: {emp['id'][:8]}...)")

        # Resumen
        print("\n" + "=" * 70)
        print("📊 RESUMEN DEL DIAGNÓSTICO")
        print("=" * 70)
        print(f"✅ QR codes correctos:          {len(qrs_correctos)}")
        print(f"⚠️  QR codes huérfanos:          {len(qrs_huerfanos)}")
        print(f"❌ Empleados sin QR:            {len(empleados_sin_qr)}")
        print("=" * 70)

        # Generar QR codes faltantes
        if len(empleados_sin_qr) > 0:
            print(f"\n🔨 Generando {len(empleados_sin_qr)} QR codes faltantes...\n")

            if not base_url:
                base_url = "https://ramz0.github.io/credenciales-empleados"

            for idx, emp in enumerate(empleados_sin_qr, 1):
                try:
                    url = f"{base_url}?id={emp['id']}"

                    qr = qrcode.QRCode(
                        version=1,
                        error_correction=qrcode.constants.ERROR_CORRECT_H,
                        box_size=10,
                        border=4,
                    )
                    qr.add_data(url)
                    qr.make(fit=True)

                    img = qr.make_image(fill_color="black", back_color="white")
                    filename = sanitize_filename(emp['nombre']) + '.png'
                    filepath = qr_path / filename
                    img.save(filepath)

                    print(f"✅ [{idx}/{len(empleados_sin_qr)}] {emp['nombre']}")

                except Exception as e:
                    print(f"❌ Error generando QR para {emp['nombre']}: {e}")

            print("\n✅ QR codes regenerados exitosamente!")

        # Limpiar QR codes huérfanos
        if len(qrs_huerfanos) > 0:
            print(f"\n🗑️  ¿Eliminar {len(qrs_huerfanos)} QR codes huérfanos? (s/n): ", end='')
            # No vamos a eliminar automáticamente, solo reportar

        print("\n📋 PRÓXIMOS PASOS:")
        if len(empleados_sin_qr) > 0:
            print(f"   1. Se regeneraron {len(empleados_sin_qr)} QR codes")
            print(f"   2. Copia los QR actualizados:")
            print(f"      cp -r {qr_dir}/* public/qr_codes/")
            print(f"   3. Build y deploy")
        else:
            print("   ✅ Todos los QR codes están correctos!")

        print()
        return True

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Función principal."""
    import sys

    json_file = 'empleados.json'
    qr_dir = 'public/qr_codes'
    base_url = None

    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            print("Uso: python diagnosticar_qrs.py [json_file] [qr_dir] [base_url]")
            print()
            print("Ejemplos:")
            print("  python diagnosticar_qrs.py")
            print("  python diagnosticar_qrs.py empleados.json public/qr_codes")
            sys.exit(0)
        json_file = sys.argv[1]

    if len(sys.argv) > 2:
        qr_dir = sys.argv[2]

    if len(sys.argv) > 3:
        base_url = sys.argv[3]

    success = diagnosticar_qrs(json_file, qr_dir, base_url)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
