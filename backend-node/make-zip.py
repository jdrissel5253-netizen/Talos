import zipfile, os

include_items = [
    'server.js', 'package.json', 'package-lock.json', 'Procfile',
    'routes', 'services', 'config', 'database', '.ebextensions', '.platform'
]

with zipfile.ZipFile('talos-backend.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for item in include_items:
        if os.path.isfile(item):
            zf.write(item, item)
        elif os.path.isdir(item):
            for root, dirs, files in os.walk(item):
                dirs[:] = [d for d in dirs if d != 'node_modules']
                for file in files:
                    filepath = os.path.join(root, file)
                    arcname = filepath.replace(os.sep, '/')
                    zf.write(filepath, arcname)

print("Done. Size:", os.path.getsize('talos-backend.zip'), "bytes")
