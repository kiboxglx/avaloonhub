@echo off
echo ==========================================
echo CONFIGURANDO GIT E ENVIANDO PROJETO
echo ==========================================

:: 1. Configura identidade (CORRIGIDO COM SEUS DADOS)
echo Configurando usuario 'kiboxglx' e email 'gfnunes07@gmail.com'...
git config --global user.name "kiboxglx"
git config --global user.email "gfnunes07@gmail.com"

:: 2. Prepara o repositorio
echo Reiniciando processos...
git init
git remote remove origin >nul 2>&1
git remote add origin https://github.com/kiboxglx/avaloonhub.git

:: 3. Adiciona e Salva (Commit)
echo Adicionando arquivos...
git add .
echo Salvando versao...
git commit -m "Avaloon Hub - Versao Final"

:: 4. Envia
echo.
echo ==========================================
echo TENTANDO ENVIAR PARA O GITHUB
echo ==========================================
echo Se uma janela abrir, faca o login nela.
echo Se pedir senha aqui, use seu TOKEN.
echo.
git branch -M main
git push -u origin main

echo.
pause
