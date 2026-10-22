from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]
out=root/'release';out.mkdir(exist_ok=True)
with zipfile.ZipFile(out/'fitnesscentrum-zwanenburg-hostinger.zip','w',zipfile.ZIP_DEFLATED) as archive:
 for file in sorted(root.rglob('*')):
  path=file.relative_to(root)
  if not file.is_file() or path.parts[0] in {'.git','.github','release','tests','.openai','test-results','node_modules'} or file.suffix.lower()=='.zip' or file.name in {'README.md','.gitignore'}:continue
  archive.write(file,path.as_posix())
print('Hostinger-ZIP gemaakt met index.html direct in de hoofdmap.')

with zipfile.ZipFile(out/'fitnesscentrum-zwanenburg-hostinger.zip') as archive:
 names=archive.namelist()
 assert 'index.html' in names
 assert not any(name.startswith(('test-results/','tests/','.github/')) for name in names)
 print(str(len(names))+' publicatiebestanden; geen tests of schermafbeeldingen in de website-ZIP.')
