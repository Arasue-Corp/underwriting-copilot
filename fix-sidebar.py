import io
with io.open('web/src/components/layout/SidebarNav.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('import Link from \"next/link\"', 'import Link from \"next/link\"\\nimport { useLanguage } from \"@/components/language-provider\"')
c = c.replace('const pathname = usePathname()', 'const pathname = usePathname()\\n  const lang = useLanguage()')

with io.open('web/src/components/layout/SidebarNav.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
