FROM node:18-alpine
WORKDIR /app/brain-data/brain-app/frontend
COPY package.json ./
RUN npm install --no-audit --no-fund
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
