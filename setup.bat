@echo off
echo ========================================
echo  INSTALLATION SHOPIFY CHECKOUT CLOAK
echo ========================================
echo.

echo [1/3] Creation du fichier .env...
copy .env.example .env >nul 2>&1
echo ✓ Fichier .env cree

echo.
echo [2/3] Generation de la base de donnees...
call npm run db:generate
call npm run db:push

echo.
echo [3/3] Installation terminee !
echo.
echo ========================================
echo  LANCER L'APPLICATION :
echo  npm run dev
echo ========================================
echo.
pause
