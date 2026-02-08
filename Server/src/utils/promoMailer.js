const { sendMail } = require("./mailer");

exports.sendPromoMail = async ({ to, name, title, message }) => {
  return sendMail({
    to,
    subject: title || "🔥 Special Offer for You!",
    html: `
      <div style="font-family: Arial; line-height:1.6">
        <h2>Hello ${name || "Food Lover"} 👋</h2>
        <p>${message}</p>
        <hr/>
        <p style="font-size:12px;color:#777">
          You received this email because you opted in for promotions.
        </p>
      </div>
    `
  });
};
