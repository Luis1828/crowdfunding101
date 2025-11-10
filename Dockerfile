FROM nginx:alpine
# Copy static site
COPY . /usr/share/nginx/html
# Replace default nginx.conf with custom (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 
