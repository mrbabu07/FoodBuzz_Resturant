# 🔒 Security Guide for FoodBuzz

## Environment Variables Security

### ⚠️ CRITICAL: Never Commit These Files

```
.env
.env.local
.env.production
.env.development
.env.test
```

### ✅ Safe to Commit

```
.env.example
.env.production.example
```

---

## 🛡️ Security Best Practices

### 1. Environment Variables

#### Generate Strong Secrets

```bash
# Generate JWT Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Session Secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Generate VAPID Keys for Push Notifications
npx web-push generate-vapid-keys
```

#### Secure Storage

- **Development**: Use `.env` file (gitignored)
- **Production**: Use platform environment variables
  - Heroku: Config Vars
  - Vercel/Netlify: Environment Variables
  - AWS: Systems Manager Parameter Store
  - Docker: Docker secrets or environment section

### 2. Database Security

#### MongoDB Atlas

```bash
# ✅ DO:
- Use strong passwords (16+ characters, mixed case, numbers, symbols)
- Enable IP whitelist (specific IPs only)
- Use database user with minimal permissions
- Enable encryption at rest
- Regular backups

# ❌ DON'T:
- Use default passwords
- Allow access from anywhere (0.0.0.0/0) in production
- Use admin user for application
- Store connection string in code
```

#### Connection String Security

```javascript
// ❌ BAD - Hardcoded
const MONGO_URI = "mongodb+srv://admin:password123@cluster.mongodb.net/db";

// ✅ GOOD - Environment variable
const MONGO_URI = process.env.MONGO_URI;
```

### 3. API Keys & Secrets

#### Stripe

```bash
# Development
STRIPE_SECRET_KEY=sk_test_...

# Production
STRIPE_SECRET_KEY=sk_live_...

# ⚠️ NEVER expose secret keys in frontend
# ⚠️ Use publishable keys (pk_) in frontend only
```

#### ImgBB / Cloudinary

```bash
# Rotate API keys every 90 days
# Monitor usage for suspicious activity
# Set rate limits if available
```

#### Email (Gmail)

```bash
# Use App Passwords, not account password
# Enable 2FA on Gmail account
# Create separate email for app notifications
# Monitor sent emails for abuse
```

### 4. JWT Security

```javascript
// ✅ Best Practices
{
  secret: process.env.JWT_SECRET, // 32+ characters
  expiresIn: '7d', // Not too long
  algorithm: 'HS256' // Secure algorithm
}

// Implement token refresh
// Blacklist tokens on logout
// Validate token on every request
```

### 5. Password Security

```javascript
// ✅ Use bcrypt with salt rounds 10+
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);

// ✅ Password requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
```

### 6. CORS Configuration

```javascript
// ✅ Production - Specific origins only
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};

// ❌ Development only - Allow all
const corsOptions = {
  origin: "*", // NEVER use in production!
};
```

### 7. Rate Limiting

```javascript
// Prevent brute force attacks
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

app.use("/api/", limiter);
```

### 8. Input Validation

```javascript
// ✅ Validate all inputs
const { body, validationResult } = require("express-validator");

app.post(
  "/api/users",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("name").trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  },
);
```

### 9. SQL/NoSQL Injection Prevention

```javascript
// ✅ Use parameterized queries
const user = await User.findOne({ email: req.body.email });

// ❌ NEVER use string concatenation
const user = await User.findOne({
  $where: `this.email == '${req.body.email}'`,
});
```

### 10. XSS Prevention

```javascript
// ✅ Sanitize user input
const xss = require("xss");
const clean = xss(userInput);

// ✅ Set security headers
const helmet = require("helmet");
app.use(helmet());
```

---

## 🔐 Deployment Security Checklist

### Before Deploying to Production

- [ ] All `.env` files are gitignored
- [ ] Strong JWT secret (32+ characters)
- [ ] Database password is strong (16+ characters)
- [ ] IP whitelist enabled on database
- [ ] CORS configured for specific origin only
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers enabled
- [ ] Input validation on all endpoints
- [ ] HTTPS/SSL enabled
- [ ] Error messages don't expose sensitive info
- [ ] Logging doesn't include passwords/tokens
- [ ] Dependencies are up to date
- [ ] Security audit completed (`npm audit`)
- [ ] Environment variables set in hosting platform
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured

### Regular Maintenance

- [ ] Rotate secrets every 90 days
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Check for security vulnerabilities
- [ ] Test backup restoration
- [ ] Review user permissions
- [ ] Monitor API usage for anomalies

---

## 🚨 Security Incident Response

### If Credentials Are Compromised

1. **Immediate Actions**
   - Rotate all affected credentials immediately
   - Revoke compromised API keys
   - Force logout all users (invalidate tokens)
   - Check logs for unauthorized access

2. **Investigation**
   - Identify what was accessed
   - Check for data breaches
   - Review recent changes
   - Document timeline

3. **Recovery**
   - Update all credentials
   - Patch vulnerabilities
   - Notify affected users if required
   - Implement additional security measures

4. **Prevention**
   - Review security practices
   - Update documentation
   - Train team on security
   - Implement monitoring

---

## 📞 Security Contacts

### Report Security Issues

- **Email**: security@foodbuzz.com
- **Response Time**: Within 24 hours
- **Disclosure**: Responsible disclosure policy

### Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🔍 Security Audit Commands

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Update packages
npm update

# Check for security issues in dependencies
npx snyk test
```

---

## 📝 Environment Variables Checklist

### Required for Production

- [ ] `MONGO_URI` - Strong password, IP whitelist enabled
- [ ] `JWT_SECRET` - 32+ characters, randomly generated
- [ ] `FRONTEND_URL` - Correct production URL
- [ ] `SMTP_USER` - App password, not account password
- [ ] `SMTP_PASS` - Gmail app password with 2FA enabled
- [ ] `STRIPE_SECRET_KEY` - Live key (sk*live*...)
- [ ] `IMGBB_API_KEY` - Valid API key

### Optional but Recommended

- [ ] `VAPID_PUBLIC_KEY` - For push notifications
- [ ] `VAPID_PRIVATE_KEY` - For push notifications
- [ ] `SESSION_SECRET` - If using sessions
- [ ] `RATE_LIMIT_MAX_REQUESTS` - Adjust based on traffic

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready

---

**Remember**: Security is not a one-time task, it's an ongoing process! 🔒
