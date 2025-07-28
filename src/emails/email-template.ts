export const emailTemplate = (to: string, verifyPath: string) => {
  return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verifikasi Email</title>
            <link href="https://fonts.googleapis.com/css2?family=Geist+Mono&display=swap" rel="stylesheet">
        </head>
        <body style="margin:0; padding:0; font-family:'Geist Mono', monospace;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="; min-height:100vh;">
                <tr>
                    <td align="center" style="padding:40px 20px;">
                        <!-- Main Container -->
                        <table cellpadding="0" cellspacing="0" border="0" width="600" 
                            style="max-width:600px; background:#ffeb3b; 
                                   border:8px solid #000; 
                                   border-radius:0;">
                            <!-- Header -->
                            <tr>
                                <td style="background:#000; padding:40px 30px; text-align:center;">

                                    <h1 style="color:#ffeb3b; font-size:20px; margin:0; text-shadow:4px 4px #000;">
                                        VERIFIKASI EMAIL
                                    </h1>
                                    <p style="color:#ffeb3b; font-size:10px; margin:10px 0 0; text-shadow:2px 2px #000;">
                                        Kami senang memiliki Anda di sini!
                                    </p>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding:40px 30px; text-align:center; color:#000;">
                                    <h2 style="font-size:16px; margin:0 0 20px; text-shadow:2px 2px #ffeb3b;">
                                        HALO ${to}!
                                    </h2>
                                    <p style="font-size:14px; line-height:1.6; margin:0;">
                                        Terima kasih telah mendaftar! Untuk menyelesaikan pendaftaran dan mengamankan akun Anda,
                                        silakan verifikasi alamat email dengan mengklik tombol di bawah ini.
                                    </p>
                                    <div style="margin:40px 0;">
                                        <a href="${verifyPath}" 
                                           style="display:inline-block; background:#1e3a8a; color:#ffffff; 
                                                  text-decoration:none; padding:12px 24px; 
                                                  font-size:14px; border:4px solid #000; 
                                                  box-shadow:4px 4px 0 #000;">
                                            VERIFIKASI EMAIL
                                        </a>
                                    </div>
                                    <div style="border-left:8px solid #000; padding:15px 20px; background:#fff176; margin:30px 0; font-size:14px;">
                                        ⚠️ Link verifikasi ini akan kedaluwarsa dalam 24 jam demi alasan keamanan.
                                    </div>
                                    <p style="font-size:10px; margin:0;">Jika Anda tidak membuat akun, abaikan saja email ini.</p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background:#000; padding:30px; text-align:center;">
                                    <p style="color:#ffeb3b; font-size:14px; margin:0;">Alief Khairul | Dev</p>
                                    <p style="color:#ffeb3b; font-size:10px; margin:5px 0 0;">Membangun pengalaman luar biasa bersama</p>
                                    <div style="border-top:4px solid #ffeb3b; padding-top:20px; margin-top:20px;">
                                        <p style="color:#ffeb3b; font-size:8px; margin:0;">
                                            © 2025 Alief Khairul | Dev. Hak cipta dilindungi undang-undang.<br>Sleman Yogyakarta<br>
                                            <a href="{{privacy_policy_link}}" style="color:#ffeb3b; text-decoration:underline;">Kebijakan Privasi</a>
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
  `;
};
