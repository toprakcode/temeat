$c = Get-Content app/demo/page.tsx -Raw
$c = $c.Replace('serves: string;', 'serves: string;' + [char]10 + '};')
Set-Content app/demo/page.tsx $c
