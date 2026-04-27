
with open('app/demo/page.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Fix the missing closing brace for LangData
if 'serves: string;' in content and 'const LD' in content:
    content = content.replace('serves: string;', 'serves: string;\n};')

with open('app/demo/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed app/demo/page.tsx")
