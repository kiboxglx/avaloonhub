@echo off
echo ==========================================
echo PREPARANDO UPLOAD PARA GITHUB
echo ==========================================

:: 1. Inicia/Reinicia o repositorio
git init

:: 2. Remove arquivos do cache (caso node_modules tenha sido adicionado antes)
echo Limpando cache do git...
git rm -r --cached . >nul 2>&1

:: 3. Adiciona arquivos respeitando o .gitignore
echo Adicionando arquivos (pode demorar um pouco)...
git add .

:: 4. Realiza o commit
echo Criando commit...
git commit -m "Avaloon Hub - Upload Completo"

:: 5. Configura a branch e o remote
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/kiboxglx/avaloonhub.git

echo.
echo ==========================================
echo TUDO PRONTO PARA O UPLOAD!
echo ==========================================
echo Agora o Git vai pedir suas credenciais.
echo 1. Uma janela pode abrir pedindo login.
echo 2. Se pedir senha no terminal, use seu TOKEN (PAT).
echo.
echo Iniciando envio...
git push -u origin main

echo.
if %errorlevel% neq 0 (
    echo [ERRO] O upload falhou. Verifique suas credenciais ou se o repositorio esta vazio.
) else (
    echo [SUCESSO] Projeto enviado para https://github.com/kiboxglx/avaloonhub
)
pause
