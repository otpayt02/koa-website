FROM python:3.11-slim
WORKDIR /app/brain-data/brain-app/inbox-processor
COPY requirements.txt ./
COPY route-inbox.py scheduler.py ./
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "scheduler.py"]
