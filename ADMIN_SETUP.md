# Sugandh Ink - Admin System Setup Guide

## 🎨 Overview

This is a complete private atelier management system for Sugandh Ink with the following features:

✅ **Invoice Generation** - Professional PDF invoices for orders  
✅ **Email Functionality** - Send invoices and announcements via email  
✅ **Customer Management** - Maintain customer records and order history  
✅ **Announcements** - Create and dispatch announcements to customers  
✅ **Product Management** - Manage product catalog with stock tracking  
✅ **Order Management** - Create and track customer orders  
✅ **Review Management** - Approve/reject client reviews  

---

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **Gmail account** (for email functionality)

---

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
cd /path/to/perfume-redesign
npm install
```

This will install:
- **express** - Web framework
- **cors** - Cross-origin support
- **dotenv** - Environment variables
- **nodemailer** - Email service
- **pdfkit** - PDF generation

### 2. Configure Environment Variables

Create a `.env` file in the root directory (it's already created, just update it):

```env
# Email Configuration
EMAIL_USER=hello@sugandhink.in
EMAIL_PASSWORD=your-godaddy-email-password
EMAIL_FROM=hello@sugandhink.in
EMAIL_HOST=smtpout.secureserver.net
EMAIL_PORT=465
EMAIL_SECURE=true

# Admin Configuration
ADMIN_PASSCODE=admin123
ADMIN_PORT=5000

# Database Configuration
DB_PATH=./data/database.json

# API Configuration
API_BASE_URL=http://localhost:5000
NODE_ENV=development
```

### 3. Set Up GoDaddy Email SMTP

1. Log in to your GoDaddy account and open your Workspace Email or Email & Office dashboard.
2. Confirm your email is active: `hello@sugandhink.in`.
3. Use the following outgoing SMTP settings in `.env`:
   - `EMAIL_HOST=smtpout.secureserver.net`
   - `EMAIL_PORT=465`
   - `EMAIL_SECURE=true`
   - `EMAIL_USER=hello@sugandhink.in`
   - `EMAIL_PASSWORD=your-godaddy-email-password`

4. If you prefer TLS instead of SSL, use:
   - `EMAIL_PORT=587`
   - `EMAIL_SECURE=false`

5. Incoming mail is not required for sending invoices, but GoDaddy incoming settings are:
   - `IMAP_HOST=imap.secureserver.net`
   - `IMAP_PORT=993`
   - `IMAP_SECURE=true`

6. Authentication must be enabled for outgoing SMTP.

7. Save the `.env` file and restart the backend server.

---

## 🎯 Running the Admin System

### Start the Backend Server

```bash
npm start
```

or in development mode:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

You should see:
```
✓ Sugandh Ink Admin Server running on http://localhost:5000
✓ Email service initialized
✓ Database location: ./data/database.json
```

### Access Admin Dashboard

Open your browser and navigate to:
```
admin.sugandhink.in/index.html
```

**Default Credentials:**
- Passcode: `admin123`

Change this in Settings → System Settings after first login

---

## 📁 Project Structure

```
perfume-redesign/
├── server.js                    # Express backend server
├── .env                         # Environment variables (KEEP PRIVATE)
├── .env.example                 # Template for .env
├── .gitignore                   # Git ignore rules
├── package.json                 # Project dependencies
├── data/
│   └── database.json            # Local database file
├── admin.sugandhink.in/
│   ├── index.html               # Admin dashboard UI
│   ├── admin.js                 # Admin logic & APIs
│   ├── admin.css                # Admin styling
│   ├── products.js              # Product data
│   └── Products/                # Product images
└── sugandhink.in/               # Public website
```

---

## 💼 Admin Features

### Customer Management
- Add customer records with email, phone, address
- Track total orders and spending per customer
- Delete customers when needed
- View complete customer database

### Invoice Generation
- Create professional invoices from orders
- Add custom discounts and notes
- Generate PDF for download
- Email invoices directly to customers
- Track all invoices in database

### Email & Announcements
- Send custom emails to single customers
- Create announcements for all customers
- Track delivery status
- Requires Gmail configured with app password

### Product Management
- Add/edit/delete product compositions
- Manage stock levels
- Track product popularity
- Update prices and descriptions

### Order Management
- Create new orders with multiple items
- Automatic stock deduction
- Toggle order status (pending/fulfilled)
- Link orders to customer records

### Review Management
- Approve/reject pending reviews
- Publish approved reviews to storefront
- Import from Google Business Profile
- Track review ratings and feedback

---

## 🔐 Security & Sensitive Data

The following files are protected in `.gitignore` and should NEVER be uploaded to GitHub:

```
.env                          # Contains email credentials
.env.local                     # Local environment overrides
data/database.json            # Local customer data
node_modules/                 # Dependencies
logs/                         # Server logs
*.db, *.sqlite               # Database files
```

**Important:** Always use environment variables for sensitive data, never hardcode credentials.

---

## 🐛 API Endpoints Reference

### Health Check
```
GET /api/health
```

### Customers
```
POST   /api/customers              # Add customer
GET    /api/customers              # List all customers
GET    /api/customers/:id          # Get specific customer
PUT    /api/customers/:id          # Update customer
DELETE /api/customers/:id          # Delete customer
```

### Invoices
```
POST /api/invoices/generate        # Generate invoice (returns PDF)
GET  /api/invoices                 # List all invoices
POST /api/email/send-invoice       # Email invoice to customer
```

### Announcements
```
POST /api/announcements            # Create announcement
GET  /api/announcements            # List announcements
POST /api/announcements/:id/send   # Send to all customers
DELETE /api/announcements/:id      # Delete announcement
```

### Email
```
POST /api/email/send               # Send custom email
POST /api/email/send-invoice       # Send invoice email
```

### Orders
```
POST /api/orders                   # Create order
GET  /api/orders                   # List orders
PUT  /api/orders/:id              # Update order status
```

---

## 📝 Example API Calls

### Create a Customer
```javascript
fetch('http://localhost:5000/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+91 98765 43210',
        address: '123 Main St, Mumbai'
    })
})
```

### Generate an Invoice
```javascript
fetch('http://localhost:5000/api/invoices/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        customerName: 'Priya Sharma',
        customerEmail: 'priya@example.com',
        customerPhone: '+91 98765 43210',
        items: [
            { name: 'Wild Blue / 01', quantity: 2, unitPrice: '₹799', total: '₹1,598' }
        ],
        subtotal: '₹1,598',
        tax: '₹0',
        discount: '₹0',
        total: '₹1,598',
        notes: 'Premium hand-delivered fragrance'
    })
})
```

### Send Announcement
```javascript
fetch('http://localhost:5000/api/announcements/123/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        customerIds: ['cust1', 'cust2', 'cust3']
    })
})
```

---

## 🔧 Troubleshooting

### Email Not Sending
- ✅ Verify Gmail credentials in `.env`
- ✅ Check 16-digit app password is correct
- ✅ Ensure 2-Step Verification is enabled
- ✅ Check server logs for error messages
- ✅ Verify `.env` file exists and readable

### Database Issues
- ✅ Ensure `data/` directory exists
- ✅ Check file permissions on `database.json`
- ✅ Clear `database.json` if corrupted

### CORS Errors
- ✅ Ensure backend server is running on port 5000
- ✅ Check `API_BASE_URL` in admin.js
- ✅ Verify admin HTML is served from correct location

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
ADMIN_PORT=5001
```

---

## 📊 Database Schema

### Customers Collection
```json
{
  "id": "timestamp_string",
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+91 XXXXX XXXXX",
  "address": "Full address",
  "createdAt": "ISO timestamp",
  "totalOrders": 5,
  "totalSpent": 25000
}
```

### Invoices Collection
```json
{
  "id": "INV-1234567890",
  "invoiceNumber": "INV-1234567890",
  "customerName": "Customer Name",
  "customerEmail": "email@example.com",
  "customerPhone": "+91 XXXXX XXXXX",
  "items": [
    {
      "name": "Product Name",
      "quantity": 2,
      "unitPrice": "₹799",
      "total": "₹1,598"
    }
  ],
  "subtotal": "₹1,598",
  "tax": "₹0",
  "discount": "₹0",
  "total": "₹1,598",
  "generatedAt": "ISO timestamp"
}
```

### Announcements Collection
```json
{
  "id": "timestamp_string",
  "title": "Announcement Title",
  "message": "Announcement message content",
  "type": "info|success|warning",
  "createdAt": "ISO timestamp",
  "sentTo": [
    { "email": "customer@example.com", "sentAt": "ISO timestamp" }
  ],
  "scheduled": false
}
```

---

## 🎁 Next Steps

1. **Customize Branding**: Update email templates in `server.js`
2. **Add More Products**: Use admin dashboard or edit `admin.sugandhink.in/products.js`
3. **Configure Backup**: Set up regular backups of `data/database.json`
4. **Monitor Logs**: Check `logs/` directory for server activities
5. **Scale Database**: Consider upgrading to MongoDB for production use

---

## 📞 Support & Documentation

For issues or questions:
1. Check `.env` configuration
2. Review server console logs
3. Verify Gmail app password
4. Test API endpoints with Postman
5. Check browser console for frontend errors

---

## ✨ Version

**Sugandh Ink Admin System v1.0**  
Last Updated: June 2026  
License: Private Atelier Use Only

---

**Happy Creating! 🌹**
