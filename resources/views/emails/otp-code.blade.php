<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sealify verification code</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px;">
        <h2 style="margin:0 0 12px; color:#111;">
            @if ($purpose === 'password_reset')
                Reset your password
            @else
                Verify your email
            @endif
        </h2>

        <p style="color:#444; line-height:1.5;">Hi {{ $name }},</p>

        <p style="color:#444; line-height:1.5;">
            @if ($purpose === 'password_reset')
                Use the code below to reset your Sealify password. It expires in 10 minutes.
            @else
                Use the code below to verify your Sealify email address. It expires in 10 minutes.
            @endif
        </p>

        <div style="font-size:32px; letter-spacing:8px; font-weight:bold; text-align:center;
                    background:#f0f0f0; border-radius:6px; padding:16px; margin:24px 0; color:#111;">
            {{ $code }}
        </div>

        <p style="color:#888; font-size:13px; line-height:1.5;">
            If you did not request this, you can safely ignore this email.
        </p>
    </div>
</body>
</html>