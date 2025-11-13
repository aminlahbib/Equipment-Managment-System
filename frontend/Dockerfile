# Use nginx as base image
FROM nginx:alpine

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy your static files to nginx html directory
COPY . /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Debug: List files to verify they're copied correctly
RUN ls -la /usr/share/nginx/html/templates/

# Expose port 80 (works for both Docker Compose and Kubernetes)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]