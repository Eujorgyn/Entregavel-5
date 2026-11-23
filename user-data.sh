#!/bin/bash
# Script de inicialização da EC2 (User Data) - FitGo
# Instala o Node.js 22, baixa o projeto do GitHub e deixa o sistema rodando na porta 80.
export HOME=/root
dnf install -y nodejs22 git

git clone https://github.com/Eujorgyn/Entregavel-5.git /opt/fitgo

cat > /etc/systemd/system/app.service <<'EOF'
[Unit]
Description=FitGo - Gestao de Academia
After=network.target

[Service]
WorkingDirectory=/opt/fitgo/backend
ExecStart=/usr/bin/node-22 /opt/fitgo/backend/server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now app
