# Build stage
FROM node:14-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
# RUN npm run build
COPY . .

# Final stage
FROM node:14-alpine
WORKDIR /app
# COPY --from=builder /frontend/dist ./frontend/dist
COPY --from=builder /app ./
COPY --from=builder /app/package*.json ./
RUN npm install
# ENV NODE_ENV=production
# EXPOSE 3000
CMD [ "npm", "start" ]