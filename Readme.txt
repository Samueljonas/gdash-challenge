 🌤️ GDash Weather Monitor

Uma solução Full-Stack distribuída para monitoramento climático em tempo real, utilizando arquitetura de microsserviços, dockerização completa e análise de dados inteligente

Link de apresentação: https://www.youtube.com/watch?v=vkQyskNBGRw

📖 Sobre o Projeto

O GDash é um sistema projetado para simular o monitoramento de usinas fotovoltaicas ou ambientes sensíveis. Ele coleta dados meteorológicos externos, processa-os em alta performance e exibe insights em um dashboard seguro e interativo.

O diferencial deste projeto é a **arquitetura desacoplada**: a coleta de dados não trava a API, e a API não depende do Frontend. Toda a comunicação de ingestão é feita via filas (RabbitMQ), garantindo resiliência mesmo se partes do sistema ficarem offline.

🏗️ Arquitetura da Solução

O fluxo de dados segue o padrão *Producer-Consumer*:

1. Collector (Python 3.10): Agente que consome a API Open-Meteo e publica na fila.
2. Queue (RabbitMQ): Buffer que garante a persistência dos dados.
3. Worker (Go 1.22): Consumidor de alta performance que valida e envia dados para a API.
4. API (NestJS): Gerencia Auth, persistência e gera Insights Simbólicos.
5. Frontend (React): Dashboard executivo com gráficos em tempo real.

---

📂 Estrutura do Projeto


gdash-challenge/
├── gdash-api/         # Backend NestJS
├── gdash-front/       # Frontend React + Vite
├── weather-collector/ # Script Python
├── weather-worker/    # Worker Golang
├── docker-compose.yml # Orquestração
└── README.md


🚀 Como Rodar (Quickstart)

A aplicação é totalmente "Dockerizada".

1. Clone o repositório


git clone https://github.com/Samueljonas/gdash-challenge

2. Suba o ambiente

Execute o comando abaixo na raiz do projeto:


Docker Compose V2 (Mais recente)

docker compose up --build -d

OU (Versão Legada)
DOCKER_BUILDKIT=0 docker-compose up --build -d`

3. Acesse a Aplicação

Após os containers subirem (confira com docker compose ps), acesse:

- Frontend: [http://localhost:5173]
- API Docs: [http://localhost:3000/api/weather/logs](
- RabbitMQ: [http://localhost:15672] (User: `guest` / Pass: `guest`)

---

🔐 Credenciais e Acesso

O sistema possui um "Seed" que cria um usuário administrador automaticamente.

| Papel | Email | Senha |
| Admin | admin@gdash.com | 123456 |

> Você também pode criar novas contas clicando em "Cadastre-se" na tela de login.


🛠️ Stack Tecnológica

| Serviço | Tecnologia | Responsabilidade |
| Coleta | Python, Requests, Schedule | Ingestão de dados externos |
| Broker | RabbitMQ | Buffer e desacoplamento |
| Worker | Go (Golang), AMQP | Processamento de alto throughput |
| API| NestJS, Mongoose, JWT | Regra de negócio e Segurança |
| Banco | MongoDB | Armazenamento NoSQL |
| Front | React, Tailwind v3, shadcn/ui | Visualização e Interação |
| Infra | Docker, Nginx | Orquestração |

---

✅ Funcionalidades

- [x]  Pipeline de Dados Completo (Python -> Rabbit -> Go -> Nest -> Mongo)
- [x]  Dashboard Interativo com Gráficos de Tendência
- [x]  Cards de KPIs em tempo real
- [x]  IA Simbólica: Geração automática de alertas e resumos
- [x]  Segurança Total: Autenticação JWT, Hash de Senha (Bcrypt) e Guards
- [x]  Exportação: Download de relatórios em CSV autenticado
- [x]  Docker: Build multistage otimizado

📝 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.
