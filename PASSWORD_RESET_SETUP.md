# Password reset setup

The password reset flow uses SMTP to send one-time links.

Set these backend environment variables before deploying:

```env
FRONTEND_URL=https://your-frontend-host.example/frontend
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
MAIL_FROM=no-reply@example.com
```

`FRONTEND_URL` must point to the directory containing `reset-password.html`. The reset token expires after one hour and is invalidated after it is used.

For Gmail, enable two-step verification, create an app password, then use `smtp.gmail.com`, port `465`, your Gmail address as `SMTP_USER`, and the app password as `SMTP_PASS`. Do not use your normal Gmail password.

For local development, SMTP can be omitted. Requests made from `localhost` or `127.0.0.1` log the reset URL in the backend terminal instead of sending email. Production requests require SMTP configuration.
