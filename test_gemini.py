import os
from dotenv import load_dotenv
from google import genai

load_dotenv(override=True, dotenv_path="backend/.env")
api_key = os.getenv("GEMINI_API_KEY")
print("Key:", api_key[:5] if api_key else None)

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents="Say hello",
    )
    print("Success:", response.text)
except Exception as e:
    print("Error:", e)
