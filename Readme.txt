# 🌤️ GDash Weather Monitor

> Uma solução Full-Stack distribuída para monitoramento climático em tempo real, utilizando arquitetura de microsserviços, dockerização completa e análise de dados inteligente.

![Project Status](https://img.shields.io/badge/status-complete-green)
![Docker](https://img.shields.io/badge/docker-compose-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

## 📖 Sobre o Projeto

O **GDash** é um sistema projetado para simular o monitoramento de usinas fotovoltaicas ou ambientes sensíveis. Ele coleta dados meteorológicos externos, processa-os em alta performance e exibe insights em um dashboard seguro e interativo.

O diferencial deste projeto é a **arquitetura desacoplada**: a coleta de dados não trava a API, e a API não depende do Frontend. Toda a comunicação de ingestão é feita via filas (RabbitMQ), garantindo resiliência mesmo se partes do sistema ficarem offline.

### 🏗️ Arquitetura da Solução

O sistema é composto por 5 serviços containerizados que rodam em orquestra:

1.  **Collector (Python 3.10):**
    * Agente responsável por consumir a API Open-Meteo periodicamente.
    * Normaliza os dados brutos e os publica na fila do RabbitMQ.
2.  **Queue (RabbitMQ):**
    * Message Broker que garante a persistência e entrega assíncrona dos dados.
3.  **Worker (Go 1.22):**
    * Consumidor de alta performance.
    * Lê a fila, valida a integridade dos dados (Structs) e envia para a API via HTTP.
4.  **API Backend (NestJS + MongoDB):**
    * Gerencia autenticação (JWT) e autorização (Guards).
    * Persiste logs históricos no MongoDB.
    * Gera **Insights de IA Simbólica** (regras de negócio para alertas de calor/frio/chuva).
    * Gera relatórios CSV para download seguro.
5.  **Frontend (React + Vite + Tailwind):**
    * Dashboard executivo com gráficos de tendência em tempo real (Recharts).
    * Sistema de Login e Registro completo com proteção de rotas.
    * Design moderno utilizando componentes shadcn/ui.

---

## 🚀 Como Rodar (Quickstart)

A aplicação é totalmente "Dockerizada". Você não precisa instalar Node, Python ou Go na sua máquina. Apenas o **Docker**.

### 1. Clone o repositório
```bash
git clone [https://github.com/SEU-USUARIO/gdash-challenge.git](https://github.com/SEU-USUARIO/gdash-challenge.git)
cd gdash-challenge
2. Suba o ambienteExecute o comando abaixo na raiz do projeto para construir as imagens e iniciar os containers:Bash# Se você tiver Docker Compose V2 (Mais recente)
docker compose up --build -d

# OU (Se usar versão Legada/Antiga)
DOCKER_BUILDKIT=0 docker-compose up --build -d

3. Acesse a AplicaçãoApós os containers subirem (verifique com docker compose ps), acesse:
Frontend (Dashboard): http://localhost:5173API 
(JSON): http://localhost:3000/api/weather/logs
RabbitMQ Management: http://localhost:15672 (Login: guest / guest)

🔐 Credenciais e AcessoO sistema possui um "Seed" que cria um usuário administrador automaticamente na primeira execução.

Login Admin: admin@gdash.com
Senha: 123456

Você também pode criar novas contas clicando em "Cadastre-se" na tela de login.

🛠️ Stack Tecnológica
Serviço             Tecnologia                      Responsabilidade 
Coleta      Python, Requests, Schedule          Ingestão de dados externos
Broker              RabbitMQ                      Buffer e desacoplamento
Worker          Go (Golang), AMQP               Processamento de alto throughput    
API        NestJS, Mongoose, JWT, Bcrypt        Regra de negócio e Segurança
Banco               MongoDB                        Armazenamento NoSQL
Front        React, Tailwind v3, shadcn/ui      Visualização e Interação
Infra              Docker, Nginx                 Orquestração e Proxy Reverso


✅ Funcionalidades Entregues

[x] Pipeline de Dados Completo (Python -> Rabbit -> Go -> Nest -> Mongo)
[x] Dashboard Interativo com Gráficos de Tendência
[x] Cards de KPIs em tempo real (Temperatura, Umidade, Chuva)
[x] IA Simbólica: Geração automática de alertas e resumos no backend
[x] Segurança Total: Autenticação JWT, Hash de Senha (Bcrypt) e Guards nas rotas
[x] Exportação de Dados: Download de relatórios em CSV autenticado
[x] Docker: Build multistage otimizado e orquestração via Compose

📝 LicençaEste projeto foi desenvolvido como parte de um desafio técnico.