# ---- Build Stage ----
FROM --platform=linux/amd64 node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY app.js ./

# ---- Production Stage ----
FROM --platform=linux/amd64 node:18-alpine AS prod
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/app.js ./app.js
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]