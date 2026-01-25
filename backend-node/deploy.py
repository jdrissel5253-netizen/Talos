import zipfile
import os

output = "deploy-bundle.zip"
base = os.path.dirname(os.path.abspath(__file__))

include_dirs = ['config', 'database', 'routes', 'services', '.ebextensions', '.platform']
include_files = ['package.json', 'package-lock.json', 'server.js', 'Procfile']

# Remove existing zip
if os.path.exists(output):
    os.remove(output)

with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as z:
    # Add directories
    for dir_name in include_dirs:
        dir_path = os.path.join(base, dir_name)
        if os.path.exists(dir_path):
            for root, dirs, files in os.walk(dir_path):
                for f in files:
                    full_path = os.path.join(root, f)
                    arc_name = os.path.relpath(full_path, base).replace('\\', '/')
                    z.write(full_path, arc_name)
                    print(f"Added: {arc_name}")

    # Add files
    for f in include_files:
        full_path = os.path.join(base, f)
        if os.path.exists(full_path):
            z.write(full_path, f)
            print(f"Added: {f}")

print(f"\nCreated {output} ({os.path.getsize(output)} bytes)")
