FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
# The router is a separate phase; check hourly and only run an existing script.
CMD ["sh", "-c", "while :; do if [ -f route-inbox.py ]; then python route-inbox.py; else echo 'Inbox router not installed; waiting for Phase 2.'; fi; sleep 3600; done"]
