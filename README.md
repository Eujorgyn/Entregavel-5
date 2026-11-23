# Entregável #5 — Aplicação Web rodando na Nuvem ☁️

**Disciplina:** N389 — Ambientes de Desenvolvimento de Software · UNIFOR
**Grupo:** Grupo 1

🔗 **Aplicação em operação:** http://32.200.104.4

---

## 📌 Sobre o projeto

Aplicação web de **calculadora** (soma, subtração, multiplicação e divisão) desenvolvida em **Node.js + Express** e publicada na nuvem da **AWS (Amazon Web Services)**, usando uma máquina virtual **EC2**.

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Back-end | JavaScript · Node.js · Express |
| Front-end | HTML · CSS · JavaScript |
| Infraestrutura | AWS EC2 (t3.micro, Amazon Linux 2023) |
| Configuração do servidor | Bash (script User Data) + systemd |

## 📁 Arquivos

| Arquivo | O que faz |
|---|---|
| `server.js` | Código da aplicação (servidor Express + página web) |
| `user-data.sh` | Script que roda quando a máquina da AWS liga: instala o Node.js, cria a aplicação e deixa ela sempre ligada |

## 🚀 Como foi publicado na nuvem

1. Criação de uma **instância EC2** na AWS — tipo `t3.micro` (nível gratuito), sistema **Amazon Linux 2023**, região `us-east-1`.
2. Configuração do **grupo de segurança** (firewall) liberando a **porta 80 (HTTP)** para a internet.
3. Uso do **User Data** (`user-data.sh`): script executado automaticamente na inicialização, que:
   - instala o **Node.js**;
   - cria os arquivos da aplicação e instala o **Express** com `npm`;
   - registra a aplicação como **serviço do systemd**, para iniciar sozinha e reiniciar em caso de falha.
4. Acesso pela internet usando o **IP público** da instância.

## 🔀 Rotas da aplicação

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Página da calculadora |
| `POST` | `/api/calcular` | Recebe `{ a, b, op }` em JSON e devolve o resultado |
| `GET` | `/health` | Status do servidor em JSON |

Exemplo:

```bash
curl -X POST http://32.200.104.4/api/calcular \
  -H "Content-Type: application/json" \
  -d '{"a": 7, "b": 5, "op": "+"}'
# {"resultado":12}
```

## 💻 Rodando localmente

```bash
npm install express
sudo node server.js   # porta 80 (ou troque para 3000 no final do arquivo)
```

## ☁️ Modelo de serviço

Esse projeto usa **IaaS (Infraestrutura como Serviço)**: a AWS fornece a máquina virtual, e toda a instalação e configuração da aplicação é feita por nós.
