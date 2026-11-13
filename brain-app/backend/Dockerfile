FROM python:3.11-slim
WORKDIR /app/brain-app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY inbox-processor/route-inbox.py /app/brain-app/inbox-processor/route-inbox.py
ENV PYTHONPATH=/app/brain-app/backend
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=3s --start-period=15s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
