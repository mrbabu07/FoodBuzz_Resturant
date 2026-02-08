// receiptTemplate.js

export function getReceiptTemplate({
  cartItems,
  subTotal,
  shipping,
  discount,
  tax,
  total,
  billing,
  receiptId,
  formattedDate,
}) {
  return `
  <html>
    <head>
      <title>FoodBaZZ Receipt</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.2/dist/tailwind.min.css" rel="stylesheet">
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background: white;
          color: #1a1a1a;
          padding: 40px;
        }
        .brand {
          text-align: center;
          margin-bottom: 30px;
        }
        .brand h1 {
          color: #f97316;
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }
        .brand p {
          font-size: 0.9rem;
          color: #6b7280;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: #374151;
        }
        table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }
        th, td {
          border-bottom: 1px solid #fcd8be;
          padding: 10px;
          text-align: left;
          word-wrap: break-word;
        }
        th {
          color: #f97316;
          font-size: 0.9rem;
          font-weight: 600;
        }
        td:nth-child(1) {
          width: 40%;
        }
        td:nth-child(2),
        td:nth-child(3),
        td:nth-child(4) {
          width: 20%;
          text-align: right;
        }
        .summary {
          max-width: 300px;
          margin-left: 150px;
          font-size: 0.9rem;
          justify-content: space-between;
        }
        /* এইখানে পরিবর্তন */
        .summary div {
          text-align: center;
          margin-bottom: 0.6rem;
          font-weight: 600;
        }
        .summary div span {
          display: inline-block;
          min-width: 110px; /* label এর জন্য জায়গা */
          margin-right: 15px;
        }
        .summary div span:last-child {
          min-width: 60px; /* মানের জন্য জায়গা */
          text-align: left;
        }
        .summary .total {
          font-weight: 900;
          font-size: 1.3rem;
          color: #f97316;
          border-top: 2px solid #f97316;
          padding-top: 0.5rem;
        }
        .billing {
          background-color: #fff7ed;
          padding: 1rem;
          border: 1px solid #fcd8be;
          border-radius: 8px;
          margin-top: 2rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }
        .footer {
          text-align: center;
          font-size: 0.85rem;
          color: #6b7280;
          margin-top: 3rem;
        }
      </style>
    </head>
    <body>
      <div class="brand">
        <h1>FoodBaZZ</h1>
        <p>Delicious Delivered With Love</p>
      </div>

      <div class="meta">
        <div><strong>Receipt ID:</strong> ${receiptId}</div>
        <div><strong>Date:</strong> ${formattedDate}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${cartItems
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>TK${item.price.toFixed(2)}</td>
              <td>TK${(item.price * item.quantity).toFixed(2)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="summary">
        <div><span>Subtotal:</span><span>TK${subTotal.toFixed(2)}</span></div>
        <div><span>Shipping:</span><span>${shipping === 0 ? "Free" : `TK${shipping.toFixed(2)}`}</span></div>
        <div><span>Discount:</span><span class="text-red-500">- TK${discount.toFixed(2)}</span></div>
        <div><span>Tax:</span><span>+ TK${tax.toFixed(2)}</span></div>
        <div class="total"><span>Total:</span><span>TK${total.toFixed(2)}</span></div>
      </div>

      <div class="billing">
        <h2 class="text-lg font-semibold text-orange-600 mb-2">Billing Info</h2>
        <p><strong>Name:</strong> ${billing.fullname || "N/A"}</p>
        <p><strong>Email:</strong> ${billing.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${billing.phone || "N/A"}</p>
        <p><strong>Address:</strong> ${billing.address || "N/A"}</p>
        <p><strong>Country:</strong> ${billing.country || "N/A"}</p>
      </div>

      <div class="footer">
        Thank you for choosing <strong>FoodBaZZ</strong>. We hope to serve you again soon!
      </div>
    </body>
  </html>
  `;
}
