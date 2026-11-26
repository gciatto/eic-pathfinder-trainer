#!/usr/bin/env python3
"""Bundle the app into a single-file page with all quiz data inlined."""
from pathlib import Path
import sys
base=Path(__file__).resolve().parents[1]
s= (base/'index.html').read_text()
css=(base/'style.css').read_text()
q=(base/'questions.js').read_text().replace('</script', '<\\/script')
js=(base/'app.js').read_text().replace('</script','<\\/script')
s=s.replace('<link rel="stylesheet" href="style.css">','<style>\n'+css+'\n</style>')
s=s.replace('<script src="questions.js"></script>','<script>\n'+q+'\n</script>')
s=s.replace('<script src="app.js"></script>','<script>\nwindow.TRAINER_STANDALONE=true;\n'+js+'\n</script>')
assert 'src="questions.js"' not in s and 'href="style.css"' not in s
output=Path(sys.argv[1]) if len(sys.argv)>1 else base/'standalone.html'
output.write_text(s)
print('Standalone HTML:',output, output.stat().st_size,'bytes')
