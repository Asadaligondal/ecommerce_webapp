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
const { v4: uuidv4 } = require('uuid'); // <--- NEW IMPORT for UUID
const PRODUCTS_TABLE_NAME = 'products'; // <--- NEW TABLE NAME

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
const { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
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

app.get('/api/products', async (req, res) => {
    const { search } = req.query; // Only get search term from query parameters
    console.log(`--- Fetching all products for public store (Search: "${search || 'none'}") ---`);

    let scanParams = {
        TableName: PRODUCTS_TABLE_NAME,
    };

    if (search) {
        const searchLower = search.toLowerCase(); // Convert search term to lowercase for comparison
        scanParams.FilterExpression = 'contains(#n, :search) OR contains(#d, :search)';
        scanParams.ExpressionAttributeNames = {
            '#n': 'name',
            '#d': 'description'
        };
        scanParams.ExpressionAttributeValues = {
            ':search': searchLower
        };
    }

    try {
        const command = new ScanCommand(scanParams);
        const { Items } = await docClient.send(command);

        console.log(`Found ${Items.length} products after filtering.`);
        res.status(200).json({ success: true, products: Items });

    } catch (error) {
        console.error("Error fetching products for public store with search from DynamoDB:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products with search.',
            error: error.message
        });
    }
});
// --- NEW: API Endpoint to Get a Single Product by ID for Public Store ---
app.get('/api/products/:productId', async (req, res) => { // <--- NO authentication for public access
    const { productId } = req.params; // Get product ID from URL parameters
    console.log(`--- Fetching single product ${productId} for public view ---`);

    try {
        const command = new GetCommand({
            TableName: PRODUCTS_TABLE_NAME,
            Key: {
                productId: productId,
            },
        });

        const { Item } = await docClient.send(command);

        if (Item) {
            console.log(`Product ${productId} found for public view.`);
            res.status(200).json({ success: true, product: Item });
        } else {
            console.warn(`Product ${productId} not found for public view.`);
            res.status(404).json({ success: false, message: 'Product not found.' });
        }

    } catch (error) {
        console.error(`Error fetching product ${productId} for public view from DynamoDB:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to fetch product ${productId} for display.`,
            error: error.message
        });
    }
});
// --- END NEW Public API Endpoint (Single Product) ---
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

app.get('/api/orders/:orderId', authenticateToken, async (req, res) => { // <--- Apply authentication
    const { orderId } = req.params; // Extract orderId from URL parameters
    console.log(`--- Fetching order details for ID: ${orderId} (protected) ---`);

    try {
        const command = new GetCommand({
            TableName: ORDERS_TABLE_NAME,
            Key: {
                orderid: orderId, // Use the correct case 'orderid' as per your DynamoDB table's partition key
            },
        });

        const { Item } = await docClient.send(command);

        if (Item) {
            console.log(`Order ${orderId} found.`);
            res.status(200).json({ success: true, order: Item });
        } else {
            console.warn(`Order ${orderId} not found.`);
            res.status(404).json({ success: false, message: 'Order not found.' });
        }

    } catch (error) {
        console.error(`Error fetching order ${orderId} from DynamoDB:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to fetch order details for ID: ${orderId}.`,
            error: error.message
        });
    }
});

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


app.put('/api/orders/:orderId/status', authenticateToken, async (req, res) => { // <--- Apply authentication
    const { orderId } = req.params; // Get orderId from URL parameters
    const { status } = req.body;   // Get new status from request body

    // Optional: Define allowed statuses to prevent arbitrary strings
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing status provided.' });
    }

    console.log(`--- Updating status for order ID: <span class="math-inline">\{orderId\} to "</span>{status}" (protected) ---`);

    try {
        const command = new UpdateCommand({
            TableName: ORDERS_TABLE_NAME,
            Key: {
                orderid: orderId, // Partition Key
            },
            UpdateExpression: 'set #s = :newStatus', // Use expression attribute name for 'status'
            ExpressionAttributeNames: {
                '#s': 'status', // Map #s to the 'status' attribute
            },
            ExpressionAttributeValues: {
                ':newStatus': status, // Set the new status value
            },
            ReturnValues: 'ALL_NEW', // Return the updated item
        });

        const { Attributes } = await docClient.send(command);

        console.log(`Order <span class="math-inline">\{orderId\} status updated to "</span>{status}".`);
        res.status(200).json({ success: true, message: 'Order status updated successfully.', order: Attributes });

    } catch (error) {
        console.error(`Error updating status for order ${orderId} in DynamoDB:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to update status for order ID: ${orderId}.`,
            error: error.message
        });
    }
});

app.post('/api/admin/products', authenticateToken, async (req, res) => {
    console.log('--- Attempting to add new product (protected) ---');
    const { name, description, price, imageUrl, stock } = req.body;

    // Basic validation
    if (!name || !description || typeof price !== 'number' || price <= 0 || !imageUrl || typeof stock !== 'number' || stock < 0) {
        console.warn("Invalid product data received for adding product.");
        return res.status(400).json({ success: false, message: 'Missing or invalid product data.' });
    }

    const productId = uuidv4(); // Generate a unique ID for the new product
    const newProduct = {
        productId,
        name,
        description,
        price,
        imageUrl,
        stock,
        createdAt: new Date().toISOString(), // Timestamp for creation
        updatedAt: new Date().toISOString()  // Timestamp for last update
    };

    try {
        const command = new PutCommand({
            TableName: PRODUCTS_TABLE_NAME,
            Item: newProduct,
        });

        await docClient.send(command);
        console.log(`Product "<span class="math-inline">\{name\}" \(</span>{productId}) added successfully.`);
        res.status(201).json({ success: true, message: 'Product added successfully!', product: newProduct });

    } catch (error) {
        console.error("Error adding new product to DynamoDB:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to add new product.',
            error: error.message
        });
    }
});

app.get('/api/admin/products', authenticateToken, async (req, res) => { // <--- Apply authentication
    console.log('--- Fetching all products for admin (protected) ---');

    try {
        const command = new ScanCommand({
            TableName: PRODUCTS_TABLE_NAME,
        });

        const { Items } = await docClient.send(command);

        console.log(`Found ${Items.length} products.`);
        res.status(200).json({ success: true, products: Items });

    } catch (error) {
        console.error("Error fetching products from DynamoDB:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products.',
            error: error.message
        });
    }
});

app.put('/api/admin/products/:productId', authenticateToken, async (req, res) => {
    const { productId } = req.params; // Get productId from URL parameters
    const { name, description, price, imageUrl, stock } = req.body; // Get updated data from body

    // Basic validation (ensure at least one field is provided, and types are correct)
    if (!name && !description && typeof price === 'undefined' && !imageUrl && typeof stock === 'undefined') {
         console.warn(`No update data provided for product ${productId}.`);
        return res.status(400).json({ success: false, message: 'No update data provided.' });
    }
    if ((typeof price !== 'undefined' && (typeof price !== 'number' || price <= 0)) ||
        (typeof stock !== 'undefined' && (typeof stock !== 'number' || stock < 0))) {
        console.warn(`Invalid price or stock data for product ${productId}.`);
        return res.status(400).json({ success: false, message: 'Invalid price or stock provided.' });
    }


    console.log(`--- Attempting to update product ${productId} (protected) ---`);

    let UpdateExpression = 'set ';
    const ExpressionAttributeNames = { '#u': 'updatedAt' }; // Always update updatedAt
    const ExpressionAttributeValues = { ':updatedAt': new Date().toISOString() };

    // Dynamically build UpdateExpression based on provided fields
    if (name) {
        UpdateExpression += '#n = :name, ';
        ExpressionAttributeNames['#n'] = 'name';
        ExpressionAttributeValues[':name'] = name;
    }
    if (description) {
        UpdateExpression += '#d = :description, ';
        ExpressionAttributeNames['#d'] = 'description';
        ExpressionAttributeValues[':description'] = description;
    }
    if (typeof price !== 'undefined') { // Check if price was provided, even if 0
        UpdateExpression += '#p = :price, ';
        ExpressionAttributeNames['#p'] = 'price';
        ExpressionAttributeValues[':price'] = price;
    }
    if (imageUrl) {
        UpdateExpression += '#i = :imageUrl, ';
        ExpressionAttributeNames['#i'] = 'imageUrl';
        ExpressionAttributeValues[':imageUrl'] = imageUrl;
    }
    if (typeof stock !== 'undefined') { // Check if stock was provided, even if 0
        UpdateExpression += '#s = :stock, ';
        ExpressionAttributeNames['#s'] = 'stock';
        ExpressionAttributeValues[':stock'] = stock;
    }

    // Add updatedAt to the expression at the end
    UpdateExpression += '#u = :updatedAt';

    try {
        const command = new UpdateCommand({
            TableName: PRODUCTS_TABLE_NAME,
            Key: {
                productId: productId,
            },
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
            ReturnValues: 'ALL_NEW', // Return the updated item
        });

        const { Attributes } = await docClient.send(command);

        if (!Attributes) {
             console.warn(`Product ${productId} not found for update.`);
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        console.log(`Product ${productId} updated successfully.`);
        res.status(200).json({ success: true, message: 'Product updated successfully!', product: Attributes });

    } catch (error) {
        console.error(`Error updating product ${productId} in DynamoDB:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to update product ${productId}.`,
            error: error.message
        });
    }
});

// --- NEW: API Endpoint to Delete a Product (Protected) ---
app.delete('/api/admin/products/:productId', authenticateToken, async (req, res) => {
    const { productId } = req.params; // Get productId from URL parameters
    console.log(`--- Attempting to delete product ${productId} (protected) ---`);

    try {
        const command = new DeleteCommand({
            TableName: PRODUCTS_TABLE_NAME,
            Key: {
                productId: productId,
            },
            ReturnValues: 'ALL_OLD', // Return the deleted item (optional, but confirms deletion)
        });

        const { Attributes } = await docClient.send(command);

        if (!Attributes) {
            // If Attributes is null, it means no item with that Key was found/deleted
            console.warn(`Product ${productId} not found for deletion.`);
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        console.log(`Product ${productId} deleted successfully.`);
        res.status(200).json({ success: true, message: 'Product deleted successfully!', deletedProduct: Attributes });

    } catch (error) {
        console.error(`Error deleting product ${productId} from DynamoDB:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to delete product ${productId}.`,
            error: error.message
        });
    }
});
// --- END NEW API Endpoint (Delete Product) ---

app.get('/api/admin/products/:productId', authenticateToken, async (req, res) => {
    const { productId } = req.params; // Get product ID from URL parameters
    console.log(`--- Fetching single product ${productId} for admin (protected) ---`);

    try {
        const command = new GetCommand({
            TableName: PRODUCTS_TABLE_NAME,
            Key: {
                productId: productId,
            },
        });

        const { Item } = await docClient.send(command);

        if (Item) {
            console.log(`Product ${productId} found.`);
            res.status(200).json({ success: true, product: Item });
        } else {
            console.warn(`Product ${productId} not found.`);
            res.status(404).json({ success: false, message: 'Product not found.' });
        }

    } catch (error) {
        console.error(`Error fetching product ${productId} from DynamoDB:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to fetch product ${productId}.`,
            error: error.message
        });
    }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});