#!/bin/bash

echo "🔄 Limpiando node_modules y package-lock.json..."
rm -rf node_modules package-lock.json

echo "📦 Reinstalando dependencias con npm..."
npm install

echo "✅ Fix aplicado localmente. Subiendo cambios..."
git add .
git commit -m "Fix rollup native module issue - clean install"
git push

echo "🚀 Ahora vuelve a desplegar en Vercel."
