// server/index.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Use CORS middleware
app.use(cors());

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// --- NEW: Order Placement API Endpoint ---
app.post('/api/place-order', (req, res) => {
  const orderData = req.body; // The data sent from your frontend will be in req.body

  console.log('--- Received New Order ---');
  console.log('Order Data:', orderData);
  console.log('--------------------------');

  // In a real application, you would:
  // 1. Validate the orderData
  // 2. Save it to a database
  // 3. Process payment (if applicable)
  // 4. Send confirmation email (which we'll do in a later step!)

  // Send a success response back to the frontend
  // You can send back a generated order ID or confirmation status
  res.status(200).json({
    success: true,
    message: 'Order received successfully!',
    orderId: `ORDER-${Date.now()}` // Sending a mock order ID back
  });
});
// --- END NEW ---

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});