import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_welcome_email(to_email: str, username: str = "User"):
    # You will need to set these in your Render Environment Variables
    sender_email = os.getenv("GMAIL_USER")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")

    if not sender_email or not sender_password:
        print("Gmail credentials not configured. Skipping welcome email.")
        return False
        
    subject = "Welcome to StakeUp! 🚀"
    
    html_content = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f5f0; border-radius: 24px;">
        <div style="background-color: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h1 style="color: #1a1a1a; margin-top: 0;">Welcome to StakeUp, {username}!</h1>
            <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; opacity: 0.8;">
                We're absolutely thrilled to have you here. StakeUp isn't just a habit tracker—it's your personal accountability engine designed to help you crush your goals.
            </p>
            <h2 style="color: #1a1a1a; margin-top: 32px; font-size: 20px;">Your First Mission:</h2>
            <ul style="color: #1a1a1a; font-size: 16px; line-height: 1.6; opacity: 0.8;">
                <li><strong>Set a Goal:</strong> Head to the dashboard and define what you want to achieve.</li>
                <li><strong>Check In Daily:</strong> Build your streak and watch your Commitment Score skyrocket.</li>
                <li><strong>Use AI Insights:</strong> Get hyper-personalized motivation based on your actual performance.</li>
            </ul>
            <div style="margin-top: 40px; text-align: center;">
                <a href="https://stakeup.vercel.app/dashboard" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                    Go to Dashboard
                </a>
            </div>
            <p style="color: #1a1a1a; font-size: 14px; margin-top: 40px; opacity: 0.5; text-align: center;">
                If you have any questions, just reply to this email!
            </p>
        </div>
    </div>
    """
    
    try:
        # Create message container
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"StakeUp <{sender_email}>"
        msg['To'] = to_email

        # Attach HTML content
        part = MIMEText(html_content, 'html')
        msg.attach(part)

        # Send the email via Gmail's SMTP server
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls() # Secure the connection
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, msg.as_string())
            
        print(f"Welcome email sent successfully to {to_email} via Gmail!")
        return True
        
    except Exception as e:
        print(f"Failed to send welcome email to {to_email}. Error: {e}")
        return False
