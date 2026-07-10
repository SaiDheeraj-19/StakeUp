import os
from groq import Groq
from google import genai
from app.core.config import settings

def verify_proof_with_gemini(image_bytes: bytes, goal_title: str) -> dict:
    """
    Sends the image bytes and Goal Title to AI Vision (Gemini first, fallback to Groq) to act as the strict ProofIQ judge.
    Returns a dict with 'verified' (bool) and 'comment' (str).
    """
    gemini_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    groq_key = os.getenv("GROQ_API_KEY")
    
    if not gemini_key and not groq_key:
        raise Exception("AI API Keys missing")
        
    try:
        
        prompt = f"""
        You are ProofIQ™, an aggressively strict, highly intelligent, and slightly snarky AI judge for a premium habit tracking app.
        The user claims they completed this goal: "{goal_title}".
        They uploaded the attached image as proof.
        
        Your job is to visually inspect the image and verify if it genuinely looks like proof of the goal being completed.
        If the image is completely unrelated (e.g., they claim "Coding" but uploaded a picture of a sandwich), you MUST REJECT it.
        If it's a blurry black screen or an obvious fake, you MUST REJECT it.
        If it reasonably looks like proof, you APPROVE it.
        
        Return ONLY valid JSON in this exact format, with no markdown formatting:
        {{
            "verified": true/false,
            "comment": "A 1-2 sentence witty, stern, or encouraging comment explaining your decision."
        }}
        """
        
        result = None
        
        # Try Gemini First
        try:
            if not gemini_key:
                raise Exception("No Gemini key")
            client = genai.Client(api_key=gemini_key)
            from google.genai import types
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type='image/jpeg'
            )
            resp = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[prompt, image_part],
                config={"response_mime_type": "application/json"}
            )
            import json
            result = json.loads(resp.text)
        except Exception as e_gem:
            print(f"Gemini Vision Error: {e_gem}, falling back to OpenRouter...")
            from dotenv import load_dotenv
            load_dotenv()
            openrouter_key = os.getenv("OPENROUTER_API_KEY")
            
            try:
                if not openrouter_key:
                    raise Exception("No OpenRouter key available")
                    
                import openai
                import base64
                import json
                
                client = openai.OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=openrouter_key,
                )
                
                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                chat_completion = client.chat.completions.create(
                    model="qwen/qwen-2.5-vl-72b-instruct",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    response_format={"type": "json_object"},
                    max_tokens=500
                )
                
                result = json.loads(chat_completion.choices[0].message.content.strip())
                
            except Exception as e_or:
                print(f"OpenRouter Error: {e_or}, falling back to Groq...")
                # Fallback to Groq
                if not groq_key:
                    raise Exception("No Groq key available for fallback")
                client = Groq(api_key=groq_key)
                import base64
                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                chat_completion = client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}",
                                    },
                                },
                            ],
                        }
                    ],
                    model="llama-3.2-90b-vision-preview",
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )
                import json
                result = json.loads(chat_completion.choices[0].message.content.strip())
            
        return {
            "verified": bool(result.get("verified", False)),
            "comment": result.get("comment", "No comment provided.")
        }
        
    except Exception as e:
        print(f"ProofIQ Vision Error: {e}")
        # Fail safe - if vision fails due to rate limit, we reject it
        return {
            "verified": False,
            "comment": "ProofIQ Vision API Error: Rate limit exceeded or invalid API key. Please check backend logs."
        }
