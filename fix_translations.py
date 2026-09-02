import re

file_path = 'web/src/app/quotes/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix table headers
content = content.replace(
    '<th className="px-6 py-3 font-medium">Coberturas</th>',
    '<th className="px-6 py-3 font-medium">{t.coverage}</th>'
)
content = content.replace(
    '<th className="px-6 py-3 font-medium">Creador</th>',
    '<th className="px-6 py-3 font-medium">{t.createdBy}</th>'
)
content = content.replace(
    '<th className="px-6 py-3 font-medium">Asignado a</th>',
    '<th className="px-6 py-3 font-medium">{t.assignee}</th>'
)

# Fix mobile card "Cotizar" button (around line 349)
content = content.replace(
    '>\n                          Cotizar\n                        </button>',
    '>\n                          {t.quote}\n                        </button>'
)

# Fix desktop "Cotizar" button (around line 457)
content = content.replace(
    '>\n                                Cotizar\n                              </button>',
    '>\n                                {t.quote}\n                              </button>'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Translations fixed.")
