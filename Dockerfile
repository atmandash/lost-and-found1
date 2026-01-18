FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./
COPY server/ ./

# Install dependencies
RUN npm install --omit=dev

# Expose port
EXPOSE 8000

# Set port
ENV PORT=8000

# Start
CMD ["npm", "start"]
