import zipfile, os, sys

exclude_files = {'check_analyses_schema.js','check_analyses_types.js','check_full_schema.js','check_jobs_schema.js','compare-keys.js','talos-backend-deploy.tar.gz'}
skip_dirs = {'.git','logs','uploads'}
exclude_exts = ('.tar.gz','.bak')

base = os.path.join(os.path.dirname(__file__), 'backend-node')
out = os.path.join(os.path.dirname(__file__), 'talos-backend.zip')

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for f in files:
            fp = os.path.join(root, f)
            try:
                arc = os.path.relpath(fp, base).replace('\\', '/')
            except ValueError:
                continue
            if os.path.basename(fp) in exclude_files:
                continue
            if any(arc.endswith(ext) for ext in exclude_exts):
                continue
            try:
                zf.write(fp, arc)
            except Exception:
                pass

print(f'Created {out}')
