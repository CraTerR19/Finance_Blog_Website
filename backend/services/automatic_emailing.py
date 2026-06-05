import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

# User's App Password for Gmail securely loaded from env
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")
# IMPORTANT: Update this to your exact Gmail address
GMAIL_SENDER = os.getenv("GMAIL_SENDER", "finverse07@gmail.com")

def get_smtp_server():
    server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
    return server

def send_post_notification_email(recipient_email: str, blog_title: str):
    try:
        msg = EmailMessage()
        msg.set_content(f"A new financial insight has been published: {blog_title}\n\nCheck it out at FinVerse!")
        msg['Subject'] = 'New FinVerse Insight Released'
        msg['From'] = GMAIL_SENDER
        msg['To'] = recipient_email

        server = get_smtp_server()
        server.send_message(msg)
        server.quit()
        print(f"Notification email sent successfully to {recipient_email}")
    except Exception as e:
        print(f"Failed to send notification email to {recipient_email}: {e}")

def send_welcome_email(recipient_email: str):
    try:
        msg = EmailMessage()
        
        # Fallback Plain Text for older email clients
        msg.set_content(
            "Hi there,\n\n"
            "Thank you so much for subscribing to the FinVerse blog! We are thrilled to have you in our community.\n\n"
            "Out of all the things you could've done today — doomscrolling, binge-watching, stress-eating — you chose to level up your finance game. Honestly? We're a little proud of you🥹\n\n"
            "Now before we dive into the good stuff, we've got a little gift for you! 🎁\n\n"
            "As a token of our appreciation, we're giving you access to our exclusive pdf attached to this mail\n\n"
            "Inside you'll find:\n"
            "📖 All the basic finance terms explained like you're 5\n"
            "💡 Key concepts you need to actually understand our blogs\n"
            "🧠 A cheat sheet so you never feel lost again\n\n"
            "(Note: This is a placeholder file. We are currently finalizing our research and will provide the official guide soon!).\n\n"
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
        <body style="font-family: Arial, sans-serif; background-color: #020205; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #0a0a10; border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #00f0ff, #ff007a); padding: 30px; text-align: center;">
              <h1 style="color: #000000; margin: 0; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">FinVerse</h1>
            </div>
            
            <!-- Body Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #00f0ff; margin-top: 0; font-size: 24px;">Hi there,</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0;">Thank you so much for subscribing to the <strong>FinVerse</strong> blog! We are thrilled to have you in our community.</p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0;">Out of all the things you could've done today — doomscrolling, binge-watching, stress-eating — you chose to level up your finance game. Honestly? We're a little proud of you 🥹</p>
              
              <!-- Gift Box Callout -->
              <div style="background: rgba(255, 255, 255, 0.05); border-left: 4px solid #ff007a; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin-top: 0; color: #ff007a; font-size: 18px;">🎁 A Little Gift For You!</h3>
                <p style="font-size: 15px; line-height: 1.5; color: #e0e0e0; margin-bottom: 0;">As a token of our appreciation, we've attached our exclusive PDF guide to this email. Consider it your financial starter pack.</p>
              </div>

              <p style="font-size: 16px; color: #00f0ff; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Inside the PDF you'll find:</p>
              <ul style="font-size: 16px; line-height: 1.7; color: #e0e0e0; padding-left: 20px;">
                <li>📖 All the basic finance terms explained like you're 5</li>
                <li>💡 Key concepts you need to actually understand our blogs</li>
                <li>🧠 A cheat sheet so you never feel lost again</li>
              </ul>
              <p style="font-size: 13px; color: #a0a5b5; font-style: italic;">(Note: The Basic Guide to Finance pdf is attached to this email!).</p>

              <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 35px 0;"></div>
              
              <p style="font-size: 16px; color: #00f0ff; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">What's coming your way every week:</p>
              <ul style="font-size: 16px; line-height: 1.7; color: #e0e0e0; padding-left: 20px;">
                <li>📊 Market research, simplified</li>
                <li>📈 Investment insights, no MBA required</li>
                <li>💸 Money lessons that actually make sense</li>
              </ul>

              <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0; margin-top: 35px;">So go grab that PDF, make yourself a cup of chai ☕, and let's get this financial glow-up started!</p>
              
              <p style="font-size: 18px; color: #00f0ff; font-weight: bold; margin-top: 30px;">Stay curious, stay bullish! 🚀</p>
              
              <p style="font-size: 15px; line-height: 1.6; color: #a0a5b5; margin-top: 40px; font-weight: bold;">— The FinVerse Team</p>
            </div>
          </div>
        </body>
        </html>
        """
        
        # Attach the HTML UI to the email
        msg.add_alternative(html_content, subtype='html')
        
        msg['Subject'] = 'Thank You for Subscribing to FinVerse! Welcome to the FinVerse Community!'
        msg['From'] = GMAIL_SENDER
        msg['To'] = recipient_email

        # Attachment logic (You can drop your actual PDF named "basic_finance_knowledge.pdf" in the backend/services folder later)
        pdf_path = "basic_finance_knowledge.pdf"
        if os.path.exists(pdf_path):
            with open(pdf_path, 'rb') as f:
                pdf_data = f.read()
            msg.add_attachment(pdf_data, maintype='application', subtype='pdf', filename="Basic_Finance_Knowledge.pdf")
        else:
            print(f"Note: PDF attachment '{pdf_path}' not found on server. Skipping attachment.")

        server = get_smtp_server()
        server.send_message(msg)
        server.quit()
        print(f"Welcome email sent successfully to {recipient_email}")
    except Exception as e:
        print(f"Failed to send welcome email to {recipient_email}: {e}")
