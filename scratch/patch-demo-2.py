import os
import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    patterns = [
        (r"role === 'ADMIN'", r"(role === 'ADMIN' || role === 'DEMO')"),
        (r"userProfile\?\.role === 'ADMIN'", r"(userProfile?.role === 'ADMIN' || userProfile?.role === 'DEMO')"),
        (r"userRole === 'ADMIN'", r"(userRole === 'ADMIN' || userRole === 'DEMO')")
    ]
    
    new_content = content
    for p, r in patterns:
        new_content = re.sub(p, r, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Patched {filepath}')

patch_file('web/src/components/dashboard/DashboardFilters.tsx')
patch_file('web/src/components/layout/MobileNav.tsx')
patch_file('web/src/components/layout/SidebarNav.tsx')
patch_file('web/src/components/tasks/TaskModal.tsx')
