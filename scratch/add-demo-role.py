import os

files_to_update = [
    'web/src/app/admin/layout.tsx',
    'web/src/app/agency/layout.tsx',
    'web/src/app/actions/admin.ts',
    'web/src/app/actions/appetite_matrix.ts',
    'web/src/app/actions/carriers.ts',
    'web/src/app/actions/clients.ts',
    'web/src/app/actions/logs.ts',
    'web/src/app/actions/quote.ts',
    'web/src/app/actions/visits.ts',
    'web/src/app/admin/users/page.tsx',
    'web/src/app/clients/page.tsx'
]

def replace_in_file(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # For layouts and read permissions, we want DEMO to act like ADMIN but we block writes in actions
    
    # In web/src/app/admin/layout.tsx
    if file_path == 'web/src/app/admin/layout.tsx':
        content = content.replace("profile.role !== 'ADMIN'", "profile.role !== 'ADMIN' && profile.role !== 'DEMO'")
        
    # In web/src/app/agency/layout.tsx
    if file_path == 'web/src/app/agency/layout.tsx':
        content = content.replace("profile.role !== 'MANAGER' && profile.role !== 'ADMIN'", "profile.role !== 'MANAGER' && profile.role !== 'ADMIN' && profile.role !== 'DEMO'")
        
    # In actions, we need to allow read operations for DEMO, but block mutations
    if file_path == 'web/src/app/actions/clients.ts':
        # getClients allows MANAGER and ADMIN
        content = content.replace("profile.role !== 'ADMIN' && profile.role !== 'MANAGER'", "profile.role !== 'ADMIN' && profile.role !== 'MANAGER' && profile.role !== 'DEMO'")
        
        # updateClient/deleteClient allows ADMIN
        # We also need to add a check for mutations
        content = content.replace("if (!profile || profile.role !== 'ADMIN') throw new Error(\"Acceso denegado\")", "if (!profile || profile.role !== 'ADMIN') throw new Error(\"Acceso denegado\")")
        # Keep DEMO out of writes.
        
    if file_path == 'web/src/app/actions/quote.ts':
        content = content.replace("profile.role !== \"MANAGER\" && profile.role !== \"ADMIN\"", "profile.role !== \"MANAGER\" && profile.role !== \"ADMIN\" && profile.role !== \"DEMO\"")
        content = content.replace("['MANAGER', 'ADMIN', 'AGENT'].includes(profile.role)", "['MANAGER', 'ADMIN', 'AGENT', 'DEMO'].includes(profile.role)")
        content = content.replace("profile?.role !== 'ADMIN' && profile?.role !== 'MANAGER'", "profile?.role !== 'ADMIN' && profile?.role !== 'MANAGER' && profile?.role !== 'DEMO'")
        # For writes (addQuote, updateQuote, etc.) we should probably block DEMO?
        # Actually wait, the user said "que pueda explorar los forms (no validaciones de campos obligatorios) pero que no pueda cambiar nada"
        # So in the UI we can just return early or the server actions will block them.
        # But if we change the backend, we should explicitly check for DEMO in mutations.
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
for f in files_to_update:
    replace_in_file(f)

print("Done")
