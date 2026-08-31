file_path = 'web/src/app/quotes/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("\\'AGENT\\'", "'AGENT'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed quotes')
