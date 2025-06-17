// server/index.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();
// --- NEW: Admin Credentials & JWT Secret (from .env) ---
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Basic check to ensure environment variables are loaded (for debugging)
if (!JWT_SECRET || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error("ERROR: Missing one or more environment variables (JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD). Please check your .env file.");
    // In a real app, you might want to exit the process or handle this gracefully.
    // For now, we'll log and continue, but the login will fail.
    // process.exit(1); // Uncomment this in production to prevent server from running without vital secrets
} else {
    console.log("Admin credentials and JWT secret loaded.");
}


function authenticateToken(req, res, next) {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) {
        console.warn("Authentication attempt: No token provided.");
        return res.status(401).json({ success: false, message: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.warn("Authentication attempt: Invalid token.", err.message);
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user; // Attach user payload to the request for later use
        console.log(`Authentication successful for user: ${user.username}`);
        next(); // Proceed to the next middleware/route handler
    });
}

// --- NEW: AWS SDK Imports for DynamoDB ---
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
// --- END NEW AWS SDK Imports ---
// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Use CORS middleware
app.use(cors());

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io", // This is common for Mailtrap, verify in your settings
    port: 2525, // This is common for Mailtrap, verify in your settings
    secure: false, // Use 'true' if your port is 465, 'false' for 587 or 2525 (TLS/STARTTLS)
    auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
}

});
transporter.verify(function (error, success) {
    if (error) {
        console.error("Nodemailer transporter verification failed:", error);
    } else {
        console.log("Nodemailer transporter is ready to send messages.");
    }
});

// --- NEW: AWS DynamoDB Client Setup ---
// IMPORTANT: REPLACE WITH YOUR ACTUAL AWS CREDENTIALS AND REGION
// In a real app, use environment variables (e.g., process.env.AWS_ACCESS_KEY_ID)
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


const docClient = DynamoDBDocumentClient.from(client);
const ORDERS_TABLE_NAME = 'Orders'; // Ensure this matches your DynamoDB table name
// --- END NEW AWS DynamoDB Client Setup ---

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// --- NEW: Order Placement API Endpoint ---
// Order Placement API Endpoint
app.post('/api/place-order', async (req, res) => {
  const orderData = req.body;

  console.log('--- Received New Order ---');
  console.log('Order Data:', orderData);
  console.log('--------------------------');

  try {
      const { fullName, email } = orderData.deliveryInfo;
      const grandTotal = orderData.grandTotal.toFixed(2);
      const orderId = `ORDER-${Date.now()}`; // Unique ID for this order

      // --- NEW: Save order to DynamoDB ---
      const orderItem = {
          orderid: orderId, // Partition Key
          items: orderData.items,
          deliveryInfo: orderData.deliveryInfo,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          grandTotal: orderData.grandTotal,
          orderDate: new Date().toISOString(), // Store date as ISO string
          status: 'Pending'
      };

      const command = new PutCommand({
          TableName: ORDERS_TABLE_NAME,
          Item: orderItem,
      });

      await docClient.send(command); // Send the command to DynamoDB
      console.log(`Order ${orderId} saved to DynamoDB.`);
      // --- END NEW: Save order to DynamoDB ---

      const mailOptions = {
          from: '"E-commerce Store" <no-reply@ecommerce.com>', // Sender address
          to: email, // Recipient email (from delivery info)
          subject: `Order Confirmation #${orderId} - E-commerce Store`, // Subject line
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #28aa46;">Thank You for Your Order!</h2>
                <p>Hi <span class="math-inline">\{fullName\},</p\><p>Your order **#{orderId}** has been successfully placed and will be processed shortly.</p>
                <p><strong>Total Amount:</strong> $${grandTotal}</p>
                <p>You will receive a separate email with tracking information once your order has shipped.</p>
                <p>In the meantime, if you have any questions, feel free to contact our customer support.</p>
                <p>Thank you for shopping with us!</p>
                <p style="margin-top: 30px; font-size: 0.9em; color: #777;">E-commerce Store Team</p>
                </div>` 
};
      await transporter.sendMail(mailOptions); // Send the email
      console.log(`Confirmation email sent to ${email} for order ${orderId}`);

      // Send a success response back to the frontend
      res.status(200).json({
        success: true,
        message: 'Order received and confirmation email sent successfully!',
        orderId: orderId // Send the actual order ID used in email
      });

  } catch (error) {
      console.error("Error processing order or sending email:", error);
      // If email fails, you might still want to return a success to frontend
      // but log the email failure. For now, we'll return an error if email fails too.
      res.status(500).json({
        success: false,
        message: 'Failed to place order or send confirmation email. Please try again.',
        error: error.message
      });
  }})

// --- NEW: API Endpoint to Get All Orders ---
app.get('/api/orders',authenticateToken, async (req, res) => {
    console.log('--- Fetching all orders ---');
    try {
        const command = new ScanCommand({
            TableName: ORDERS_TABLE_NAME,
        });

        const { Items } = await docClient.send(command);
        console.log(`Found ${Items.length} orders.`);
        res.status(200).json({ success: true, orders: Items });

    } catch (error) {
        console.error("Error fetching orders from DynamoDB:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders.',
            error: error.message
        });
    }
});
// --- END NEW API Endpoint ---


app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    // IMPORTANT: For a real app, you would hash and salt passwords and compare securely.
    // This is for demonstration purposes only.
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Generate a token
        const token = jwt.sign({ username: ADMIN_USERNAME, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
        console.log(`Admin ${username} logged in. Token generated.`);
        res.status(200).json({ success: true, message: 'Logged in successfully!', token });
    } else {
        console.warn(`Failed login attempt for username: ${username}. Invalid credentials.`);
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});