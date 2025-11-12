E-Commerce Webapp
A full-stack e-commerce application with React frontend and Node.js backend, containerized with Docker. Features product listing, cart, checkout, admin panel, and email notifications.

Prerequisites
Docker and Docker Compose installed
AWS account with DynamoDB tables (products and orders)
Mailtrap or Gmail account for email
Setup
Clone the repository.
Create .env with your credentials (see .env.example).
Ensure DynamoDB tables exist in your AWS region.
Running the App
Frontend: http://localhost:8080
Backend API: http://localhost:5000
Environment Variables
Set in .env:

AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
EMAIL_USER, EMAIL_PASS (for Nodemailer)
Usage
Browse products on the homepage.
Admin login at /admin/login to manage products/orders.
For issues, check Docker logs: docker-compose logs.