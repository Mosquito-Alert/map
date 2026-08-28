#!/bin/sh

cat <<EOF > /app/config.js
window.APP_CONFIG = {
  CARTO_API_KEY: "${VITE_CARTO_API_KEY}"
};
EOF