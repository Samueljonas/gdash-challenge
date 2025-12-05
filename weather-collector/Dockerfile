# Imagem base leve do Python
FROM python:3.10-slim

# Cria pasta de trabalho
WORKDIR /app

# Instala dependências
# (Dica: Criar requirements.txt se não tiver: pip freeze > requirements.txt)
# Para facilitar, vou instalar direto aqui no comando para garantir:
RUN pip install requests pika schedule

# Copia o código
COPY . .

# Comando para rodar
CMD ["python", "main.py"]