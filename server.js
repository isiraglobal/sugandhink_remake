/**
 * Sugandh Ink Admin Backend Server
 * Features: Email, PDF Invoicing, Customer Management, Announcements
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.ADMIN_PORT || 5000;

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✓ Supabase Client initialized');
} else {
    console.warn('⚠️  Supabase URL/Key missing in .env');
}

// Auto-keepalive: ping Supabase every 6 days to prevent 7-day inactivity pause
const KEEPALIVE_MS = 6 * 24 * 60 * 60 * 1000;
setInterval(async () => {
    try {
        if (supabase) {
            const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
            console.log('[KeepAlive]', error ? 'FAILED: ' + error.message : 'OK');
        }
    } catch (e) {
        console.error('[KeepAlive] Error:', e.message);
    }
}, KEEPALIVE_MS);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve Static Frontends
app.use('/admin', express.static(path.join(__dirname, 'admin.sugandhink.in')));
app.use('/', express.static(path.join(__dirname, 'sugandhink.in')));

// Public Configuration endpoint for client Supabase init
app.get('/api/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        adminEmail: process.env.ADMIN_EMAIL,
        adminPasscode: process.env.ADMIN_PASSCODE || 'admin123'
    });
});

// ════════════════════════════════════════════════════════════════════════════
// EMAIL SERVICE
// ════════════════════════════════════════════════════════════════════════════

let transporter = null;

function initializeEmailService() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️  Email credentials not configured in .env file');
        return false;
    }

    try {
        const auth = {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        };

        const transportOptions = process.env.EMAIL_HOST
            ? {
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT || '465', 10),
                secure: process.env.EMAIL_SECURE === 'true',
                auth,
                tls: {
                    rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED !== 'false'
                }
            }
            : {
                service: process.env.EMAIL_SERVICE || 'gmail',
                auth
            };

        transporter = nodemailer.createTransport(transportOptions);

        transporter.verify((error, success) => {
            if (error) {
                console.error('Email service verification failed:', error);
            } else {
                console.log('✓ Email service initialized and verified');
            }
        });

        return true;
    } catch (err) {
        console.error('Email service initialization failed:', err);
        return false;
    }
}

async function sendEmail(to, subject, htmlContent) {
    if (!transporter) {
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent
        });
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Email send error:', err);
        return { success: false, error: err.message };
    }
}

// ════════════════════════════════════════════════════════════════════════════
// PDF INVOICE GENERATOR
// ════════════════════════════════════════════════════════════════════════════

function generateInvoicePDF(invoiceData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('Sugandh Ink', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Private Atelier Ledger', { align: 'center' });
            doc.fontSize(10).text('sugandhink.in', { align: 'center' });
            doc.moveDown(0.5);

            // Invoice Title and Number
            doc.fontSize(14).font('Helvetica-Bold').text('INVOICE', { align: 'left' });
            doc.fontSize(10).font('Helvetica');
            doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, { align: 'left' });
            doc.text(`Date: ${invoiceData.date}`, { align: 'left' });
            doc.text(`Due Date: ${invoiceData.dueDate}`, { align: 'left' });
            doc.moveDown(0.5);

            // Bill To
            doc.fontSize(11).font('Helvetica-Bold').text('BILL TO:');
            doc.fontSize(10).font('Helvetica');
            doc.text(invoiceData.customerName);
            doc.text(invoiceData.customerEmail);
            doc.text(invoiceData.customerPhone || '');
            
            // Format Address with shipping accords
            let fullAddress = invoiceData.customerAddress || '';
            if (invoiceData.city) fullAddress += `, ${invoiceData.city}`;
            if (invoiceData.state) fullAddress += `, ${invoiceData.state}`;
            if (invoiceData.country) fullAddress += `, ${invoiceData.country}`;
            if (invoiceData.zipCode || invoiceData.zip_code) {
                fullAddress += ` - ${invoiceData.zipCode || invoiceData.zip_code}`;
            }
            doc.text(fullAddress);
            doc.moveDown(1);

            // Items Table
            const tableTop = doc.y;
            const col1 = 50;
            const col2 = 280;
            const col3 = 350;
            const col4 = 450;

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Item', col1, tableTop);
            doc.text('Quantity', col2, tableTop);
            doc.text('Unit Price', col3, tableTop);
            doc.text('Total', col4, tableTop);

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            let yPosition = tableTop + 25;
            doc.fontSize(9).font('Helvetica');

            invoiceData.items.forEach(item => {
                doc.text(item.name, col1, yPosition, { width: 220 });
                doc.text(String(item.quantity), col2, yPosition);
                doc.text(item.unitPrice, col3, yPosition);
                doc.text(item.total, col4, yPosition);
                yPosition += 25;
            });

            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            yPosition += 10;

            // Totals
            doc.fontSize(10).font('Helvetica');
            doc.text(`Subtotal: ${invoiceData.subtotal}`, col3, yPosition);
            yPosition += 20;

            if (invoiceData.tax) {
                doc.text(`Tax (${invoiceData.taxPercent || 0}%): ${invoiceData.tax}`, col3, yPosition);
                yPosition += 20;
            }

            if (invoiceData.discount) {
                doc.text(`Discount: ${invoiceData.discount}`, col3, yPosition);
                yPosition += 20;
            }

            doc.fontSize(11).font('Helvetica-Bold');
            doc.text(`TOTAL: ${invoiceData.total}`, col3, yPosition);
            yPosition += 30;

            // Notes
            if (invoiceData.notes) {
                doc.fontSize(9).font('Helvetica-Bold').text('NOTES:');
                doc.fontSize(9).font('Helvetica').text(invoiceData.notes, { width: 400 });
            }

            // Footer
            doc.moveTo(50, doc.y + 20).lineTo(550, doc.y + 20).stroke();
            doc.fontSize(8).font('Helvetica').text('Thank you for your patronage. Sugandh Ink - Luxury Fragrances', 50, doc.y + 10, { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

// ════════════════════════════════════════════════════════════════════════════
// API ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Health Check
app.get('/api/health', async (req, res) => {
    let dbOk = false;
    try {
        if (supabase) {
            const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
            dbOk = !error;
        }
    } catch (_) { /* keep dbOk false */ }
    res.json({ status: 'ok', database: dbOk, timestamp: new Date().toISOString() });
});

// ── CUSTOMER MANAGEMENT ──────────────────────────────────────────────────────

app.post('/api/customers', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const customer = {
            id: req.body.id || Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city || '',
            state: req.body.state || '',
            country: req.body.country || '',
            zip_code: req.body.zipCode || req.body.zip_code || '',
            total_orders: 0,
            total_spent: 0
        };
        const { data, error } = await supabase.from('customers').insert([customer]).select();
        if (error) throw error;
        res.json({ success: true, customer: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/customers', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        // Map database fields to match client expectations
        const mapped = data.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            address: c.address || '',
            city: c.city || '',
            state: c.state || '',
            country: c.country || '',
            zipCode: c.zip_code || '',
            totalOrders: c.total_orders,
            totalSpent: c.total_spent,
            createdAt: c.created_at
        }));
        res.json({ success: true, customers: mapped });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/customers/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('customers').select('*').eq('id', req.params.id).single();
        if (error) throw error;
        
        const customer = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            zipCode: data.zip_code || '',
            totalOrders: data.total_orders,
            totalSpent: data.total_spent,
            createdAt: data.created_at
        };
        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const updates = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            zip_code: req.body.zipCode || req.body.zip_code
        };
        const { data, error } = await supabase.from('customers').update(updates).eq('id', req.params.id).select();
        if (error) throw error;
        
        const c = data[0];
        const customer = {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            address: c.address || '',
            city: c.city || '',
            state: c.state || '',
            country: c.country || '',
            zipCode: c.zip_code || '',
            totalOrders: c.total_orders,
            totalSpent: c.total_spent,
            createdAt: c.created_at
        };
        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('customers').delete().eq('id', req.params.id).select();
        if (error) throw error;
        
        const c = data[0];
        const customer = {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            address: c.address || '',
            city: c.city || '',
            state: c.state || '',
            country: c.country || '',
            zipCode: c.zip_code || '',
            totalOrders: c.total_orders,
            totalSpent: c.total_spent,
            createdAt: c.created_at
        };
        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── INVOICE MANAGEMENT ───────────────────────────────────────────────────────

app.post('/api/invoices/generate', async (req, res) => {
    try {
        const invoiceData = {
            ...req.body,
            invoiceNumber: `INV-${Date.now()}`,
            date: new Date().toLocaleDateString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // Save to database
        if (supabase) {
            const dbInvoice = {
                id: invoiceData.invoiceNumber,
                invoice_number: invoiceData.invoiceNumber,
                customer_name: invoiceData.customerName,
                customer_email: invoiceData.customerEmail,
                customer_phone: invoiceData.customerPhone || '',
                customer_address: invoiceData.customerAddress || '',
                city: invoiceData.city || '',
                state: invoiceData.state || '',
                country: invoiceData.country || '',
                zip_code: invoiceData.zipCode || invoiceData.zip_code || '',
                items: invoiceData.items,
                subtotal: invoiceData.subtotal,
                tax: invoiceData.tax || '₹0',
                discount: invoiceData.discount || '₹0',
                total: invoiceData.total,
                notes: invoiceData.notes || '',
                promo_code: invoiceData.promoCode || invoiceData.promo_code || ''
            };
            const { error } = await supabase.from('invoices').insert([dbInvoice]);
            if (error) console.error('Supabase Invoice write error:', error);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Invoice generation error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/invoices', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('invoices').select('*').order('generated_at', { ascending: false });
        if (error) throw error;
        
        const mappedInvoices = data.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            customerName: inv.customer_name,
            customerEmail: inv.customer_email,
            customerPhone: inv.customer_phone,
            customerAddress: inv.customer_address,
            city: inv.city || '',
            state: inv.state || '',
            country: inv.country || '',
            zipCode: inv.zip_code || '',
            items: inv.items,
            subtotal: inv.subtotal,
            tax: inv.tax,
            discount: inv.discount,
            total: inv.total,
            notes: inv.notes,
            promoCode: inv.promo_code || '',
            generatedAt: inv.generated_at
        }));
        res.json({ success: true, invoices: mappedInvoices });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── EMAIL FUNCTIONALITY ──────────────────────────────────────────────────────

app.post('/api/email/send', async (req, res) => {
    try {
        const { to, subject, htmlContent } = req.body;

        if (!to || !subject || !htmlContent) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const result = await sendEmail(to, subject, htmlContent);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/email/send-invoice', async (req, res) => {
    try {
        const { customerEmail, customerName, invoiceData } = req.body;

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        const htmlContent = `
            <h2>Invoice from Sugandh Ink</h2>
            <p>Dear ${customerName},</p>
            <p>Thank you for your order. Please find your invoice attached.</p>
            <p>Invoice #: ${invoiceData.invoiceNumber}</p>
            <p>Total: ${invoiceData.total}</p>
            <p>Best regards,<br>Sugandh Ink Team</p>
        `;

        if (!transporter) {
            return res.status(500).json({ success: false, error: 'Email service not configured' });
        }

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Invoice #${invoiceData.invoiceNumber} - Sugandh Ink`,
            html: htmlContent,
            attachments: [
                {
                    filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });

        res.json({ success: true, message: 'Invoice email sent' });
    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── ANNOUNCEMENTS ────────────────────────────────────────────────────────────

app.post('/api/announcements', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const announcement = {
            id: Date.now().toString(),
            title: req.body.title,
            message: req.body.message,
            type: req.body.type || 'info',
            scheduled: req.body.scheduled || false,
            sent_to: []
        };

        const { data, error } = await supabase.from('announcements').insert([announcement]).select();
        if (error) throw error;

        const ann = data[0];
        res.json({
            success: true,
            announcement: {
                id: ann.id,
                title: ann.title,
                message: ann.message,
                type: ann.type,
                createdAt: ann.created_at,
                scheduled: ann.scheduled,
                sentTo: ann.sent_to || []
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/announcements', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        const mapped = data.map(ann => ({
            id: ann.id,
            title: ann.title,
            message: ann.message,
            type: ann.type,
            createdAt: ann.created_at,
            scheduled: ann.scheduled,
            sentTo: ann.sent_to || []
        }));
        res.json({ success: true, announcements: mapped });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/announcements/:id/send', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data: ann, error: annErr } = await supabase.from('announcements').select('*').eq('id', req.params.id).single();
        if (annErr || !ann) {
            return res.status(404).json({ success: false, error: 'Announcement not found' });
        }

        const { data: customers, error: custErr } = await supabase.from('customers').select('*');
        if (custErr) throw custErr;

        const customerEmails = req.body.customerIds
            ? customers.filter(c => req.body.customerIds.includes(c.id)).map(c => c.email)
            : customers.map(c => c.email);

        let sentCount = 0;
        let failedCount = 0;
        const sentToArr = ann.sent_to || [];

        for (const email of customerEmails) {
            const result = await sendEmail(
                email,
                ann.title,
                `<h2>${ann.title}</h2><p>${ann.message}</p>`
            );

            if (result.success) {
                sentCount++;
                sentToArr.push({ email, sentAt: new Date().toISOString() });
            } else {
                failedCount++;
            }
        }

        const { data: updatedAnn, error: updateErr } = await supabase
            .from('announcements')
            .update({ sent_to: sentToArr })
            .eq('id', req.params.id)
            .select()
            .single();
            
        if (updateErr) throw updateErr;

        res.json({
            success: true,
            sentCount,
            failedCount,
            announcement: {
                id: updatedAnn.id,
                title: updatedAnn.title,
                message: updatedAnn.message,
                type: updatedAnn.type,
                createdAt: updatedAnn.created_at,
                scheduled: updatedAnn.scheduled,
                sentTo: updatedAnn.sent_to || []
            }
        });
    } catch (err) {
        console.error('Announcement send error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/announcements/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('announcements').delete().eq('id', req.params.id).select();
        if (error) throw error;
        
        const ann = data[0];
        res.json({
            success: true,
            announcement: {
                id: ann.id,
                title: ann.title,
                message: ann.message,
                type: ann.type,
                createdAt: ann.created_at,
                scheduled: ann.scheduled,
                sentTo: ann.sent_to || []
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── ORDERS MANAGEMENT ────────────────────────────────────────────────────────

app.post('/api/orders', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const order = {
            id: req.body.id || `ORD-${Date.now()}`,
            customer_id: req.body.customerId || null,
            collector: req.body.collector,
            email: req.body.email,
            wa: req.body.wa,
            items: req.body.items,
            value: req.body.total || req.body.value,
            date: req.body.date || new Date().toLocaleDateString('en-IN'),
            status: req.body.status || 'pending',
            promo_code: req.body.promoCode || req.body.promo_code || '',
            discount: req.body.discount || '',
            address: req.body.address || '',
            city: req.body.city || '',
            state: req.body.state || '',
            country: req.body.country || '',
            zip_code: req.body.zipCode || req.body.zip_code || ''
        };

        const { data, error } = await supabase.from('orders').insert([order]).select();
        if (error) throw error;

        // Update customer total orders and spent if customerId exists
        if (req.body.customerId) {
            const { data: customer, error: custErr } = await supabase.from('customers').select('*').eq('id', req.body.customerId).single();
            if (!custErr && customer) {
                const count = (customer.total_orders || 0) + 1;
                const spent = (customer.total_spent || 0) + parseFloat((req.body.total || req.body.value || '0').replace(/[^\d.]/g, ''));
                await supabase.from('customers').update({ total_orders: count, total_spent: spent }).eq('id', req.body.customerId);
            }
        }

        const ord = data[0];
        res.json({
            success: true,
            order: {
                id: ord.id,
                customerId: ord.customer_id,
                collector: ord.collector,
                email: ord.email,
                wa: ord.wa,
                items: ord.items,
                value: ord.value,
                date: ord.date,
                status: ord.status,
                promoCode: ord.promo_code,
                discount: ord.discount,
                address: ord.address,
                city: ord.city,
                state: ord.state,
                country: ord.country,
                zipCode: ord.zip_code
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        const mappedOrders = data.map(ord => ({
            id: ord.id,
            customerId: ord.customer_id,
            collector: ord.collector,
            email: ord.email,
            wa: ord.wa,
            items: ord.items,
            value: ord.value,
            date: ord.date,
            status: ord.status,
            promoCode: ord.promo_code,
            discount: ord.discount,
            address: ord.address,
            city: ord.city,
            state: ord.state,
            country: ord.country,
            zipCode: ord.zip_code
        }));
        res.json({ success: true, orders: mappedOrders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('orders').update({ status: req.body.status }).eq('id', req.params.id).select();
        if (error) throw error;
        
        const ord = data[0];
        res.json({
            success: true,
            order: {
                id: ord.id,
                customerId: ord.customer_id,
                collector: ord.collector,
                email: ord.email,
                wa: ord.wa,
                items: ord.items,
                value: ord.value,
                date: ord.date,
                status: ord.status,
                promoCode: ord.promo_code,
                discount: ord.discount,
                address: ord.address,
                city: ord.city,
                state: ord.state,
                country: ord.country,
                zipCode: ord.zip_code
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── PRODUCTS MANAGEMENT (Supabase Integration) ──────────────────────────────
app.get('/api/products', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
        if (error) throw error;
        
        const mapped = data.map(p => ({
            code: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            notes: p.notes,
            shortNotes: p.short_notes,
            occasion: p.occasion,
            description: p.description,
            image: p.image
        }));
        res.json({ success: true, products: mapped });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const product = {
            id: req.body.code,
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock !== undefined ? req.body.stock : 50,
            notes: req.body.notes,
            short_notes: req.body.shortNotes,
            occasion: req.body.occasion,
            description: req.body.description,
            image: req.body.image
        };
        const { data, error } = await supabase.from('products').insert([product]).select();
        if (error) throw error;
        res.json({ success: true, product: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const updates = {
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock,
            notes: req.body.notes,
            short_notes: req.body.shortNotes,
            occasion: req.body.occasion,
            description: req.body.description,
            image: req.body.image
        };
        const { data, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select();
        if (error) throw error;
        res.json({ success: true, product: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('products').delete().eq('id', req.params.id).select();
        if (error) throw error;
        res.json({ success: true, product: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── REVIEWS MANAGEMENT (Supabase Integration) ───────────────────────────────
app.get('/api/reviews', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        const mapped = data.map(r => ({
            id: r.id,
            productCode: r.product_code,
            name: r.name,
            rating: r.rating,
            text: r.text,
            date: r.date,
            source: r.source,
            status: r.status,
            createdAt: r.created_at
        }));
        res.json({ success: true, reviews: mapped });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const review = {
            id: req.body.id || `g_rev_${Date.now()}`,
            product_code: req.body.productCode,
            name: req.body.name,
            rating: req.body.rating,
            text: req.body.text,
            date: req.body.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            source: req.body.source || 'web',
            status: req.body.status || 'pending'
        };
        const { data, error } = await supabase.from('reviews').insert([review]).select();
        if (error) throw error;
        res.json({ success: true, review: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/reviews/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const updates = {
            status: req.body.status,
            rating: req.body.rating,
            text: req.body.text
        };
        const { data, error } = await supabase.from('reviews').update(updates).eq('id', req.params.id).select();
        if (error) throw error;
        res.json({ success: true, review: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('reviews').delete().eq('id', req.params.id).select();
        if (error) throw error;
        res.json({ success: true, review: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── NEWSLETTER SUBSCRIBERS ──────────────────────────────────────────────────

app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { email, name } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
        const subscriber = {
            id: `sub_${Date.now()}`,
            email,
            name: name || null
        };
        const { data, error } = await supabase.from('newsletter_subscribers').insert([subscriber]).select();
        if (error) {
            if (error.code === '23505') return res.json({ success: true, message: 'Already subscribed' });
            throw error;
        }
        res.json({ success: true, subscriber: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/newsletter/subscribers', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
        if (error) throw error;
        res.json({ success: true, subscribers: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/newsletter/subscribers/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('newsletter_subscribers').delete().eq('id', req.params.id).select();
        if (error) throw error;
        res.json({ success: true, subscriber: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── BACK IN STOCK ───────────────────────────────────────────────────────────

app.post('/api/back-in-stock', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { product_code, email, name } = req.body;
        if (!product_code || !email) return res.status(400).json({ success: false, error: 'Product code and email are required' });
        const request = {
            id: `bis_${Date.now()}`,
            product_code,
            email,
            name: name || null
        };
        const { data, error } = await supabase.from('back_in_stock_requests').insert([request]).select();
        if (error) throw error;
        res.json({ success: true, request: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/back-in-stock', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('back_in_stock_requests').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ success: true, requests: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/back-in-stock/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('back_in_stock_requests').update({ notified: true }).eq('id', req.params.id).select();
        if (error) throw error;
        res.json({ success: true, request: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── COUPONS ─────────────────────────────────────────────────────────────────

app.get('/api/coupons', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ success: true, coupons: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/coupons/validate', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, error: 'Coupon code is required' });
        const { data, error } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).single();
        if (error || !data) return res.json({ success: false, error: 'Invalid coupon code' });
        if (!data.is_active) return res.json({ success: false, error: 'Coupon is no longer active' });
        if (data.expires_at && new Date(data.expires_at) < new Date()) return res.json({ success: false, error: 'Coupon has expired' });
        if (data.current_uses >= data.max_uses) return res.json({ success: false, error: 'Coupon usage limit reached' });
        res.json({ success: true, coupon: data, discount_percent: data.discount_percent });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/coupons', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const coupon = {
            code: req.body.code.toUpperCase(),
            discount_percent: req.body.discount_percent,
            description: req.body.description || '',
            max_uses: req.body.max_uses || 100,
            current_uses: 0,
            is_active: req.body.is_active !== undefined ? req.body.is_active : true,
            expires_at: req.body.expires_at || null
        };
        const { data, error } = await supabase.from('coupons').insert([coupon]).select();
        if (error) {
            if (error.code === '23505') return res.status(409).json({ success: false, error: 'Coupon code already exists' });
            throw error;
        }
        res.json({ success: true, coupon: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/coupons/:code', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const updates = {
            discount_percent: req.body.discount_percent,
            description: req.body.description,
            max_uses: req.body.max_uses,
            is_active: req.body.is_active,
            expires_at: req.body.expires_at
        };
        Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
        const { data, error } = await supabase.from('coupons').update(updates).eq('code', req.params.code).select();
        if (error) throw error;
        res.json({ success: true, coupon: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/coupons/:code', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('coupons').delete().eq('code', req.params.code).select();
        if (error) throw error;
        res.json({ success: true, coupon: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GIFT CARDS ──────────────────────────────────────────────────────────────

app.get('/api/gift-cards', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('gift_cards').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ success: true, giftCards: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/gift-cards', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const code = req.body.code || `GIFT-${Date.now().toString(36).toUpperCase()}`;
        const giftCard = {
            id: `gc_${Date.now()}`,
            code,
            amount: req.body.amount,
            remaining_balance: req.body.amount,
            recipient_email: req.body.recipient_email || null,
            recipient_name: req.body.recipient_name || null,
            sender_name: req.body.sender_name || null,
            message: req.body.message || null,
            is_active: true,
            expires_at: req.body.expires_at || null
        };
        const { data, error } = await supabase.from('gift_cards').insert([giftCard]).select();
        if (error) throw error;
        res.json({ success: true, giftCard: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/gift-cards/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('gift_cards').update(req.body).eq('id', req.params.id).select();
        if (error) throw error;
        res.json({ success: true, giftCard: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/gift-cards/:id', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('gift_cards').delete().eq('id', req.params.id).select();
        if (error) throw error;
        res.json({ success: true, giftCard: data[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── ORDER FULFILLMENT ───────────────────────────────────────────────────────

app.put('/api/orders/:id/fulfill', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.from('orders').update({ status: 'fulfilled' }).eq('id', req.params.id).select();
        if (error) throw error;
        const ord = data[0];
        if (transporter && ord.email) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                    to: ord.email,
                    subject: `Order ${ord.id} Fulfilled - Sugandh Ink`,
                    html: `<h2>Order Fulfilled</h2><p>Dear ${ord.collector},</p><p>Your order <strong>${ord.id}</strong> has been fulfilled.</p><p>Total: ${ord.value}</p><p>Thank you for your patronage.</p><p>Sugandh Ink Team</p>`
                });
            } catch (emailErr) {
                console.error('Fulfillment email error:', emailErr.message);
            }
        }
        res.json({
            success: true,
            order: {
                id: ord.id, customerId: ord.customer_id, collector: ord.collector,
                email: ord.email, wa: ord.wa, items: ord.items, value: ord.value,
                date: ord.date, status: ord.status, promoCode: ord.promo_code,
                discount: ord.discount, address: ord.address, city: ord.city,
                state: ord.state, country: ord.country, zipCode: ord.zip_code
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put('/api/orders/:id/ship', async (req, res) => {
    try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const trackingNumber = req.body.tracking_number || req.body.trackingNumber || '';
        const { data, error } = await supabase.from('orders').update({ status: 'shipped' }).eq('id', req.params.id).select();
        if (error) throw error;
        const ord = data[0];
        res.json({
            success: true,
            order: {
                id: ord.id, customerId: ord.customer_id, collector: ord.collector,
                email: ord.email, wa: ord.wa, items: ord.items, value: ord.value,
                date: ord.date, status: ord.status, promoCode: ord.promo_code,
                discount: ord.discount, address: ord.address, city: ord.city,
                state: ord.state, country: ord.country, zipCode: ord.zip_code,
                trackingNumber
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ════════════════════════════════════════════════════════════════════════════
// SERVER INITIALIZATION
// ════════════════════════════════════════════════════════════════════════════

initializeEmailService();

app.listen(PORT, () => {
    console.log(`✓ Sugandh Ink Admin Server running on http://localhost:${PORT}`);
});

export default app;
