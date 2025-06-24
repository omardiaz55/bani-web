#!/bin/bash

cd /home/ojo/bani-web || exit 1

echo "🕓 [$(date)] Iniciando actualización automática de noticias" >> log_cron.txt

# Asegura que el archivo log no cause conflictos
git rm --cached log_cron.txt >/dev/null 2>&1

# 1. Obtener la última versión del repositorio
git pull --rebase origin main >> log_cron.txt 2>&1

# 2. Ejecutar scraping
node scripts/scraping.js >> log_cron.txt 2>&1

# 3. Si hay cambios en noticias.json, hacer commit y push
if git diff --quiet noticias.json; then
  echo "🟡 No hay cambios en noticias.json" >> log_cron.txt
else
  echo "🟢 Cambios detectados en noticias.json. Haciendo commit..." >> log_cron.txt
  git add noticias.json
  git commit -m "Actualización automática de noticias $(date +%Y-%m-%d)" >> log_cron.txt 2>&1
  git push origin main >> log_cron.txt 2>&1
  echo "✅ Noticias actualizadas correctamente." >> log_cron.txt
fi

echo "🏁 [$(date)] Proceso finalizado" >> log_cron.txt
