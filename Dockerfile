# Build stage
FROM node:14-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run install-deployment
RUN npm run build

# Final stage
FROM node:14-alpine
WORKDIR /app
# COPY --from=builder /frontend/dist ./frontend/dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install
ENV NODE_ENV=production
EXPOSE 3000
CMD [ "npm", "start" ]