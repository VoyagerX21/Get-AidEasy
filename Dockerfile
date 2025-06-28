FROM python:3.10-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1

CMD [ "gunicorn", "--bind", " 0.0.0.0:8000", "app:app" ]