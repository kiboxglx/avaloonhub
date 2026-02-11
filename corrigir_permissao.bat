@echo off
echo ==========================================
echo CORRIGINDO PROBLEMA DE PERMISSAO (NODE_MODULES)
echo ==========================================

echo 1. Removendo node_modules do Git (mantendo local)...
git rm -r --cached node_modules >nul 2>&1

echo 2. Forcando atualizacao do index...
git add .

echo 3. Criando commit de correcao...
git commit -m "Fix: Remove node_modules from git tracking to fix permission denied"

echo 4. Enviando correcao...
git push origin main

echo.
echo ==========================================
echo PRONTO!
echo Agora o Netlify vai baixar as dependencias do zero
echo e o erro de permissao deve sumir.
echo ==========================================
pause
