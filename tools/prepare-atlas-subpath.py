"""Build the existing Atlas release for the Global site's /Atlas mount."""
from pathlib import Path
import re
import shutil
import sys

root = Path(__file__).resolve().parent
source = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / 'atlas-domain-source'
stage = root / 'atlas-subpath-build'
stage.mkdir(exist_ok=True)
for folder in ('src', 'public'):
    shutil.copytree(source / folder, stage / folder, dirs_exist_ok=True)
for name in ('package.json', 'vite.config.js', 'index.html'):
    shutil.copy2(source / name, stage / name)
shutil.copytree(source / 'node_modules/three', stage / 'node_modules/three', dirs_exist_ok=True)

# Rebase URL literals, including template URLs and the route table, together.
for file in (stage / 'src').glob('*.js'):
    content = file.read_text(encoding='utf-8')
    content = re.sub(r'''(["'`])/(?=[a-zA-Z"'`])''', r'\1/Atlas/', content)
    content = content.replace('href="/"', 'href="/Atlas/"')
    if file.name == 'main.js':
        content = content.replace("const isHome=path==='/Atlas/'", "const isHome=path==='/Atlas'")
    if file.name == 'audio.js':
        content = content.replace("location.pathname.split('/Atlas/')[1]", "location.pathname.slice('/Atlas'.length).split('/')[1]")
    file.write_text(content, encoding='utf-8')

# Vite rebases imports, CSS URLs and the favicon via its existing base option.
print(stage)
