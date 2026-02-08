// Email Templates for Notifications
// File: src/utils/emailTemplates.js

/**
 * Base email template with FoodBuzz branding
 */
function baseTemplate(content, title = "FoodBuzz Notification") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    .highlight {
      background-color: #fff7ed;
      border-left: 4px solid #f97316;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .order-details {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .order-details table {
      width: 100%;
      border-collapse: collapse;
    }
    .order-details td {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .order-details td:first-child {
      font-weight: 600;
      color: #374151;
    }
    .order-details td:last-child {
      text-align: right;
      color: #6b7280;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">🍔 FoodBuzz</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>FoodBuzz</strong> - Delicious Food, Delivered Fast</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/notification-preferences" style="color: #f97316; text-decoration: none;">
          Manage Notification Preferences
        </a>
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        This email was sent to you because you have an account with FoodBuzz.<br>
        If you didn't request this email, please ignore it.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Order Placed Email Template
 */
function orderPlacedTemplate(orderData) {
  const { orderNumber, total, items, deliveryAddress, phone } = orderData;

  const itemsList = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.name}</strong><br>
        <span style="color: #6b7280; font-size: 14px;">Qty: ${item.qty}</span>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${item.price} BDT
      </td>
    </tr>
  `,
    )
    .join("");

  const content = `
    <div style="text-align: center;">
      <div class="icon">🎉</div>
      <h2 style="color: #f97316; margin: 0 0 10px;">Order Placed Successfully!</h2>
      <p style="color: #6b7280; font-size: 16px;">Thank you for your order!</p>
    </div>

    <div class="highlight">
      <p style="margin: 0; font-size: 16px;">
        <strong>Order #${orderNumber}</strong> has been received and is being prepared by our chefs.
      </p>
    </div>

    <div class="order-details">
      <h3 style="margin-top: 0; color: #374151;">Order Details</h3>
      <table>
        ${itemsList}
        <tr>
          <td style="padding: 15px 0 5px; border: none;"><strong>Total</strong></td>
          <td style="padding: 15px 0 5px; border: none; text-align: right; font-size: 18px; color: #f97316;">
            <strong>${total} BDT</strong>
          </td>
        </tr>
      </table>
    </div>

    <div class="order-details">
      <h3 style="margin-top: 0; color: #374151;">Delivery Information</h3>
      <p style="margin: 5px 0;"><strong>Address:</strong> ${deliveryAddress || "N/A"}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone || "N/A"}</p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/order_tracking?orderId=${orderData._id}" class="button">
        Track Your Order
      </a>
    </div>

    <p style="color: #6b7280; text-align: center; margin-top: 30px;">
      We'll notify you when your order status changes.
    </p>
  `;

  return baseTemplate(content, "Order Placed - FoodBuzz");
}

/**
 * Order Status Update Email Template
 */
function orderStatusTemplate(orderData, status) {
  const { orderNumber, total } = orderData;

  const statusConfig = {
    preparing: {
      icon: "👨‍🍳",
      title: "Order Being Prepared",
      message: "Our chefs are working on your delicious meal!",
      color: "#3b82f6",
    },
    ready: {
      icon: "✅",
      title: "Order Ready!",
      message: "Your order is ready for pickup/delivery.",
      color: "#10b981",
    },
    delivered: {
      icon: "🚚",
      title: "Order Delivered!",
      message: "Your order has been delivered. Enjoy your meal!",
      color: "#10b981",
    },
    cancelled: {
      icon: "❌",
      title: "Order Cancelled",
      message:
        "Your order has been cancelled. Refund will be processed if applicable.",
      color: "#ef4444",
    },
  };

  const config = statusConfig[status] || statusConfig.preparing;

  const content = `
    <div style="text-align: center;">
      <div class="icon">${config.icon}</div>
      <h2 style="color: ${config.color}; margin: 0 0 10px;">${config.title}</h2>
      <p style="color: #6b7280; font-size: 16px;">${config.message}</p>
    </div>

    <div class="highlight">
      <p style="margin: 0; font-size: 16px;">
        <strong>Order #${orderNumber}</strong><br>
        <span style="color: #6b7280;">Total: ${total} BDT</span>
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/order_tracking?orderId=${orderData._id}" class="button">
        View Order Details
      </a>
    </div>

    ${
      status === "delivered"
        ? `
    <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
      <p style="margin: 0 0 10px; font-size: 16px; color: #9a3412;">
        <strong>How was your experience?</strong>
      </p>
      <p style="margin: 0; color: #6b7280;">
        We'd love to hear your feedback!
      </p>
    </div>
    `
        : ""
    }
  `;

  return baseTemplate(content, `Order ${config.title} - FoodBuzz`);
}

/**
 * Promo/Offer Email Template
 */
function promoTemplate(promoData) {
  const { title, description, discountType, discountValue, validUntil } =
    promoData;

  const discountText =
    discountType === "percentage"
      ? `${discountValue}% OFF`
      : `${discountValue} BDT OFF`;

  const content = `
    <div style="text-align: center;">
      <div class="icon">🎁</div>
      <h2 style="color: #f97316; margin: 0 0 10px;">${title}</h2>
      <p style="color: #6b7280; font-size: 16px;">${description}</p>
    </div>

    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
      <p style="color: #fff; font-size: 48px; font-weight: bold; margin: 0;">
        ${discountText}
      </p>
      <p style="color: #fff; margin: 10px 0 0; font-size: 14px;">
        Valid until ${new Date(validUntil).toLocaleDateString()}
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/order_1st" class="button">
        Order Now
      </a>
    </div>

    <p style="color: #6b7280; text-align: center; margin-top: 30px; font-size: 14px;">
      Don't miss out on this amazing offer!
    </p>
  `;

  return baseTemplate(content, `${title} - FoodBuzz`);
}

/**
 * Recipe Email Template
 */
function recipeTemplate(recipeData) {
  const { name, category, description, imageUrl } = recipeData;

  const content = `
    <div style="text-align: center;">
      <div class="icon">🍽️</div>
      <h2 style="color: #f97316; margin: 0 0 10px;">New Recipe Added!</h2>
      <p style="color: #6b7280; font-size: 16px;">Check out our latest delicious recipe</p>
    </div>

    ${
      imageUrl
        ? `
    <div style="text-align: center; margin: 30px 0;">
      <img src="${imageUrl}" alt="${name}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    </div>
    `
        : ""
    }

    <div class="highlight">
      <h3 style="margin: 0 0 10px; color: #374151;">${name}</h3>
      <p style="margin: 0; color: #6b7280;">
        <strong>Category:</strong> ${category}
      </p>
      ${description ? `<p style="margin: 10px 0 0; color: #6b7280;">${description}</p>` : ""}
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/recipes/${recipeData._id}" class="button">
        View Recipe
      </a>
    </div>

    <p style="color: #6b7280; text-align: center; margin-top: 30px;">
      Try this recipe and let us know what you think!
    </p>
  `;

  return baseTemplate(content, `New Recipe: ${name} - FoodBuzz`);
}

/**
 * Security Alert Email Template
 */
function securityTemplate(securityData) {
  const { message, action } = securityData;

  const content = `
    <div style="text-align: center;">
      <div class="icon">🔒</div>
      <h2 style="color: #ef4444; margin: 0 0 10px;">Security Alert</h2>
      <p style="color: #6b7280; font-size: 16px;">Important security notification</p>
    </div>

    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin: 30px 0;">
      <p style="margin: 0; color: #991b1b; font-size: 16px;">
        <strong>${message}</strong>
      </p>
      ${action ? `<p style="margin: 10px 0 0; color: #991b1b;">Action: ${action}</p>` : ""}
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/profile" class="button" style="background: #ef4444;">
        Review Security Settings
      </a>
    </div>

    <p style="color: #6b7280; text-align: center; margin-top: 30px; font-size: 14px;">
      If you didn't perform this action, please contact support immediately.
    </p>
  `;

  return baseTemplate(content, "Security Alert - FoodBuzz");
}

module.exports = {
  orderPlacedTemplate,
  orderStatusTemplate,
  promoTemplate,
  recipeTemplate,
  securityTemplate,
};
