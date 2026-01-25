import zipfile
import os
import sys

def create_package():
    # Configuration
    output_filename = "talos-backend.zip"
    source_dir = os.getcwd()
    
    # Exclusions
    excluded_dirs = {
        'node_modules', 
        '.git', 
        'uploads', 
        '__pycache__',
        'tmp',
        '.elasticbeanstalk'  # excluded because we only need .ebextensions
    }
    
    excluded_files = {
        'talos.db', 
        output_filename, 
        '.DS_Store',
        'backend_logs.txt',
        'envs.json',
        'events.json',
        'log_url.txt',
        'logs_info.json',
        'test_output.txt',
        'test_output_2.txt',
        'test_output_3.txt',
        'create-package.ps1', # Don't need the builder script itself
        'create_package.py',
        'package-lock.json'
    }

    # Explicit inclusions (to ensure we grab dotfiles that might be missed)
    include_prefixes = ['.ebextensions', '.platform', '.env', 'Procfile', 'package.json']

    print(f"Creating {output_filename}...")
    
    print(f"Source Dir (CWD): {source_dir}")

    count = 0
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in excluded_dirs]
            
            for file in files:
                if file in excluded_files:
                    continue
                
                if file.endswith('.log') or file.endswith('.zip'):
                    if file != 'Procfile': 
                        if file != output_filename:
                             pass
                
                try:
                    file_path = os.path.join(root, file)
                    # Use abspath to normalize
                    file_path_abs = os.path.abspath(file_path)
                    source_dir_abs = os.path.abspath(source_dir)
                    
                    arcname = os.path.relpath(file_path_abs, source_dir_abs)
                    
                    # Force forward slashes for Linux compatibility
                    arcname = arcname.replace(os.path.sep, '/')
                    
                    if '/' not in arcname and arcname in excluded_files:
                        continue

                    zipf.write(file_path, arcname)
                    count += 1
                except ValueError as e:
                    print(f"Error processing {file}: {e}")
                    print(f"Root: {root}, Source: {source_dir}")
                    # Continue instead of crashing
                    continue
                except Exception as e:
                    print(f"Unexpected error on {file}: {e}")
                    continue

    print(f"Successfully created {output_filename} with {count} files.")

if __name__ == "__main__":
    create_package()
