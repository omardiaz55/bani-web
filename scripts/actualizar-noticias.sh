#!/bin/bash

cd /home/ojo/bani-web || exit 1

echo "🕓 [$(date)] Iniciando actualización automática de noticias"

# 1. Obtener la última versión del repositorio
git pull --rebase origin main

# 2. Ejecutar scraping
node scripts/scraping.js

# 3. Verificar si noticias.json cambió
if git diff --quiet noticias.json; then
  echo "🟡 No hay cambios en noticias.json. No se hace commit."
else
  echo "🟢 Cambios detectados en noticias.json. Haciendo commit..."
  git add noticias.json
  git commit -m "Actualización automática de noticias $(date +'%Y-%m-%d')"
  git pull --rebase origin main
  git push origin main
  echo "✅ Noticias actualizadas correctamente."
fi

echo "🏁 [$(date)] Proceso finalizado"
