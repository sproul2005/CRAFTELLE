const nodemailer = require('nodemailer');

const sendNotification = async (type, data) => {
    console.log(`[NOTIFICATION] Preparing to send ${type} to ${data.email}`);

    try {
        let transporter;

        
        if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_PORT === '465', 
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            
            console.log("No SMTP credentials found in .env. Falling back to Ethereal Email for testing.");
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, 
                auth: {
                    user: testAccount.user, 
                    pass: testAccount.pass, 
                },
            });
        }

        let subject = '';
        let htmlBody = '';

        if (type === 'ORDER_PLACED') {
            subject = `Order Confirmation - #${data.orderId}`;

            
            const itemsList = data.orderItems ? data.orderItems.map(item =>
                `<li>${item.quantity}x ${item.name} (${item.size}) - ₹${item.price}</li>`
            ).join('') : '<li>Items details unavailable</li>';

            htmlBody = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4A90E2;">Thank you for your order, ${data.userName || 'Customer'}!</h2>
                    <p>Your order <strong>#${data.orderId}</strong> has been placed successfully.</p>
                    
                    <h3>Order Summary:</h3>
                    <ul>
                        ${itemsList}
                    </ul>
                    <p style="font-size: 1.1em; font-weight: bold;">Total Paid: ₹${data.totalPrice || 'N/A'}</p>
                    
                    <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                        If you have any questions, please reply to this email or contact our support team.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.8em; color: #999; text-align: center;">Craftelle E-Commerce</p>
                </div>
            `;
        } else if (type === 'ADMIN_NEW_ORDER') {
            subject = `🚨 New Order Received! - #${data.orderId}`;

            const itemsList = data.orderItems ? data.orderItems.map(item =>
                `<li>${item.quantity}x ${item.name} (${item.size}) - ₹${item.price}</li>`
            ).join('') : '<li>Items details unavailable</li>';

            htmlBody = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #E24A4A;">New Order Alert!</h2>
                    <p>Customer <strong>${data.userName || 'Unknown'}</strong> has just placed order <strong>#${data.orderId}</strong>.</p>
                    <p><strong>Customer Email:</strong> ${data.customerEmail}</p>
                    <p><strong>Customer Phone:</strong> ${data.phone}</p>
                    
                    <h3>Order Items:</h3>
                    <ul>
                        ${itemsList}
                    </ul>
                    <p style="font-size: 1.1em; font-weight: bold;">Total Paid: ₹${data.totalPrice || 'N/A'}</p>
                    
                    <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                        Please log into the Admin panel to view the full details and process the order.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.8em; color: #999; text-align: center;">Craftelle E-Commerce Notifications</p>
                </div>
            `;
        } else {
            subject = `Notification from Craftelle`;
            htmlBody = `<p>This is a default notification: ${type}</p>`;
        }

        
        let info = await transporter.sendMail({
            from: '"Craftelle Support" <craftelle0203@gmail.com>', 
            to: data.email, 
            subject: subject, 
            html: htmlBody, 
        });

        console.log("Message sent: %s", info.messageId);

        
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendNotification;
