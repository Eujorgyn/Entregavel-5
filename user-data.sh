#!/bin/bash
# Script de inicialização da EC2 (User Data) - Entregável #5
# Baixa o projeto do GitHub, instala as dependências e deixa o servidor rodando na porta 80.
export HOME=/root
dnf install -y nodejs git

git clone https://github.com/Eujorgyn/Entregavel-5.git /opt/app
cd /opt/app/backend
npm install --omit=dev

cat > /etc/systemd/system/app.service <<'EOF'
[Unit]
Description=Entregavel5 - Calculadora na Nuvem
After=network.target

[Service]
WorkingDirectory=/opt/app/backend
ExecStart=/usr/bin/node /opt/app/backend/server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now app
