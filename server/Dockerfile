FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies (using npm install - more forgiving than npm ci)
RUN npm install --production

# Expose port
EXPOSE 8000

# Set port
ENV PORT=8000

# Start
CMD ["npm", "start"]
