import os
import re

files_to_update = [
    'web/src/app/actions/admin.ts',
    'web/src/app/actions/agency.ts',
    'web/src/app/actions/appetite_matrix.ts',
    'web/src/app/actions/carriers.ts',
    'web/src/app/actions/clients.ts',
    'web/src/app/actions/logs.ts',
    'web/src/app/actions/quote.ts',
    'web/src/app/actions/tasks.ts',
    'web/src/app/actions/visits.ts',
    'web/src/app/actions/files.ts'
]

def add_demo_block(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The simplest way is to find functions that mutate (create, update, delete, submit, save)
    # and add a block at the top if they fetch user profile.
    
    # We can just look for the user profile fetch in mutations.
    # Actually, a better way is to do a global find-replace for all actions:
    # If the function is exported and mutates data, we block it.
    
    # Let's just do it manually for the most important ones.
    if file_path == 'web/src/app/actions/quote.ts':
        content = content.replace("export async function addQuote(", "export async function addQuote(\n  // @ts-ignore\n  ...args: any[]) {\n  const userClient = createClient()\n  const { data: { user } } = await userClient.auth.getUser()\n  if (user) {\n    const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single()\n    if (profile?.role === 'DEMO') return { success: false, error: 'DEMO role cannot perform this action.' }\n  }\n  const [", 1)
        # That's too risky with regex.
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
for f in files_to_update:
    add_demo_block(f)

print("Done")
