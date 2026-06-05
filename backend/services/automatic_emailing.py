import os
import base64
import json
import urllib.request
import urllib.error
import logging
from dotenv import load_dotenv

load_dotenv()

# Securely load Resend settings from environment variables
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
# Default to Resend onboarding email if sender is not configured
RESEND_SENDER = os.getenv("RESEND_SENDER", "onboarding@resend.dev")

def send_email_via_resend(to_email: str, subject: str, text_content: str, html_content: str = None, pdf_path: str = None):
    if not RESEND_API_KEY:
        logging.error("RESEND_API_KEY is not configured in the environment variables.")
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    payload = {
        "from": RESEND_SENDER,
        "to": [to_email],
        "subject": subject,
        "text": text_content
    }

    if html_content:
        payload["html"] = html_content

    if pdf_path and os.path.exists(pdf_path):
        try:
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()
            pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
            payload["attachments"] = [
                {
                    "content": pdf_base64,
                    "filename": os.path.basename(pdf_path)
                }
            ]
        except Exception as e:
            logging.warning(f"Note: PDF attachment '{pdf_path}' not found or could not be read: {e}. Skipping attachment.")

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req) as res:
            res_body = res.read().decode("utf-8")
            logging.info(f"Email sent successfully via Resend API to {to_email}. Response: {res_body}")
            return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        logging.error(f"Failed to send email via Resend API to {to_email}. HTTP Error {e.code}: {error_body}")
        return False
    except Exception as e:
        logging.error(f"Failed to send email via Resend API to {to_email}: {e}")
        return False

def send_post_notification_email(recipient_email: str, blog_title: str):
    subject = "New FinVerse Insight Released"
    text_content = f"A new financial insight has been published: {blog_title}\n\nCheck it out at FinVerse!"
    html_content = f"<p>A new financial insight has been published: <strong>{blog_title}</strong></p><p>Check it out at FinVerse!</p>"
    send_email_via_resend(recipient_email, subject, text_content, html_content)

def send_welcome_email(recipient_email: str):
    subject = "Thank You for Subscribing to FinVerse! Welcome to the FinVerse Community!"
    
    # Fallback Plain Text for older email clients
    text_content = (
        "Hi there,\n\n"
        "Thank you so much for subscribing to the FinVerse blog! We are thrilled to have you in our community.\n\n"
        "Out of all the things you could've done today — doomscrolling, binge-watching, stress-eating — you chose to level up your finance game. Honestly? We're a little proud of you🥹\n\n"
        "Now before we dive into the good stuff, we've got a little gift for you! 🎁\n\n"
        "As a token of our appreciation, we're giving you access to our exclusive pdf attached to this mail\n\n"
        "Inside you'll find:\n"
        "📖 All the basic finance terms explained like you're 5\n"
        "💡 Key concepts you need to actually understand our blogs\n"
        "🧠 A cheat sheet so you never feel lost again\n\n"
        "What's coming your way every week:\n"
        "📊 Market research, simplified\n"
        "📈 Investment insights, no MBA required\n"
        "💸 Money lessons that actually make sense\n\n"
        "So go grab that PDF, make yourself a cup of chai ☕, and let's get this financial glow-up started!\n\n"
        "Stay curious, stay bullish!\n\n"
        "The FinVerse Team"
    )

    # Rich HTML Email UI
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to FinVerse</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050a0c; color: #ffffff; margin: 0; padding: 40px 10px;">
      <div style="max-width: 600px; margin: 0 auto; background: #0b1316; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 24px; overflow: hidden; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(188, 239, 204, 0.05); position: relative;">
        
        <!-- Glowing Top Bar -->
        <div style="height: 4px; background: linear-gradient(90deg, #bcefcc, #F2D07C);"></div>
        
        <!-- Header Section -->
        <div style="padding: 40px 30px 20px 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.04);">
          <div style="display: inline-block; padding: 12px 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 800; font-family: sans-serif; letter-spacing: 2px; text-transform: uppercase;">
              <span style="color: #bcefcc;">Fin</span><span style="color: #ffffff;">Verse</span>
            </h1>
          </div>
          <p style="margin: 0; color: #a0a5b5; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;">Market Insights & Macro Research</p>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 30px 40px 40px 40px;">
          <h2 style="color: #F2D07C; margin-top: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">Welcome to the Inner Circle,</h2>
          <p style="font-size: 15px; line-height: 1.7; color: #cfd3d6; margin-bottom: 20px;">Thank you so much for subscribing to the <strong>FinVerse</strong> digest. We are absolutely thrilled to have you join our community of forward-thinking investors and learners.</p>
          
          <p style="font-size: 15px; line-height: 1.7; color: #cfd3d6; margin-bottom: 30px;">Out of all the choices you could have made today, you chose to invest in your financial future and level up your finance game. Honestly? We're a little proud of you 🥹</p>
          
          <!-- Gift Box Callout (Gold Glassmorphism) -->
          <div style="background: rgba(242, 208, 124, 0.04); border: 1px solid rgba(242, 208, 124, 0.15); border-left: 4px solid #F2D07C; padding: 25px; margin: 30px 0; border-radius: 4px 16px 16px 4px;">
            <h3 style="margin-top: 0; margin-bottom: 10px; color: #F2D07C; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">🎁 A Special Gift For You</h3>
            <p style="font-size: 14.5px; line-height: 1.6; color: #e0e0e0; margin: 0;">As a token of our appreciation, we have attached our exclusive PDF starter pack: <strong>The Basic Guide to Finance</strong> to this email. It is fully compiled and ready to read.</p>
          </div>

          <div style="margin: 30px 0;">
            <p style="font-size: 14px; color: #bcefcc; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px;">Inside the Guide, you'll unlock:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; vertical-align: top; width: 30px; font-size: 16px;">📖</td>
                <td style="padding: 6px 0; font-size: 14.5px; color: #cfd3d6; line-height: 1.5;"><strong>Glossary of Terms:</strong> Macro and personal finance terms explained like you are five years old.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top; width: 30px; font-size: 16px;">💡</td>
                <td style="padding: 6px 0; font-size: 14.5px; color: #cfd3d6; line-height: 1.5;"><strong>Core Concepts:</strong> Fundamental frameworks needed to decode market updates.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top; width: 30px; font-size: 16px;">🧠</td>
                <td style="padding: 6px 0; font-size: 14.5px; color: #cfd3d6; line-height: 1.5;"><strong>Cheat Sheet:</strong> Actionable principles so you never get lost in the noise again.</td>
              </tr>
            </table>
          </div>

          <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05); margin: 35px 0;">
          
          <div style="margin: 30px 0;">
            <p style="font-size: 14px; color: #bcefcc; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px;">What's headed your way every week:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; vertical-align: top; width: 30px; font-size: 16px;">📊</td>
                <td style="padding: 6px 0; font-size: 14.5px; color: #cfd3d6; line-height: 1.5;"><strong>Market Research:</strong> High-end summaries of institutional market shifts, simplified.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top; width: 30px; font-size: 16px;">📈</td>
                <td style="padding: 6px 0; font-size: 14.5px; color: #cfd3d6; line-height: 1.5;"><strong>Investment Insights:</strong> Portfolio strategies and trends—no MBA required.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; vertical-align: top; width: 30px; font-size: 16px;">💸</td>
                <td style="padding: 6px 0; font-size: 14.5px; color: #cfd3d6; line-height: 1.5;"><strong>Practical Wealth Rules:</strong> Real-life money lessons that actually make sense.</td>
              </tr>
            </table>
          </div>

          <!-- CTA Button Section -->
          <div style="text-align: center; margin: 40px 0 20px 0;">
            <a href="https://github.com/CraTerR19/Finance_Blog_Website" target="_blank" style="display: inline-block; padding: 16px 36px; background: linear-gradient(90deg, #bcefcc, #F2D07C); color: #050a0c; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 100px; box-shadow: 0 4px 15px rgba(188, 239, 204, 0.3); text-transform: uppercase; letter-spacing: 0.05em;">
              Explore FinVerse Dashboard
            </a>
          </div>

          <p style="font-size: 15px; line-height: 1.7; color: #cfd3d6; margin-top: 35px; text-align: center;">
            Grab a hot cup of coffee ☕, open the PDF, and let's kickstart this wealth glow-up together!
          </p>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <p style="font-size: 16px; color: #bcefcc; font-weight: 700; margin: 0 0 5px 0;">Stay curious, stay bullish! 🚀</p>
            <p style="font-size: 13px; color: #a0a5b5; margin: 0;">— The FinVerse Team</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    """
    
    pdf_path = "basic_finance_knowledge.pdf"
    send_email_via_resend(recipient_email, subject, text_content, html_content, pdf_path)
