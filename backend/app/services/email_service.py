import os
import resend
from app.core.config import settings

def init_resend():
    api_key = os.getenv("RESEND_API_KEY")
    if api_key:
        resend.api_key = api_key
    return api_key is not None

def send_welcome_email(to_email: str, username: str = "User"):
    if not init_resend():
        print("Resend API Key not found. Skipping welcome email.")
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
                <a href="http://localhost:3000/dashboard" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
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
        r = resend.Emails.send({
            "from": "StakeUp <onboarding@resend.dev>",
            "to": to_email,
            "subject": subject,
            "html": html_content
        })
        print(f"Welcome email sent successfully to {to_email}! Response: {r}")
        return True
    except Exception as e:
        print(f"Failed to send welcome email to {to_email}. Error: {e}")
        return False
