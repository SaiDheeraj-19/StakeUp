from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json
import asyncio
from groq import Groq
from tavily import AsyncTavilyClient

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class ResearchRequest(BaseModel):
    topic: str

class Resource(BaseModel):
    title: str
    url: str
    description: str
    type: str # "docs", "video", "roadmap", "article"

class ResearchResponse(BaseModel):
    topic: str
    summary: str
    resources: List[Resource]

@router.post("/curate", response_model=ResearchResponse)
async def curate_resources(
    request: ResearchRequest,
    current_user: User = Depends(get_current_user),
):
    from dotenv import load_dotenv
    load_dotenv(override=True)
    tavily_key = os.getenv("TAVILY_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    
    if not tavily_key or (not gemini_key and not groq_key):
        raise HTTPException(status_code=500, detail="Missing API keys for AI research.")

    tavily_client = AsyncTavilyClient(api_key=tavily_key)
    
    topic = request.topic

    # Perform concurrent searches for different resource types
    try:
        results = await asyncio.gather(
            tavily_client.search(f"best official documentation and guides for {topic}", search_depth="basic", max_results=3),
            tavily_client.search(f"best youtube video tutorials for {topic}", search_depth="basic", max_results=3),
            tavily_client.search(f"latest learning roadmap and curriculum for {topic}", search_depth="basic", max_results=3)
        )
    except Exception as e:
        print(f"Tavily Search Error: {e}")
        raise HTTPException(status_code=500, detail="Search failed.")

    docs_results, video_results, roadmap_results = results

    # Compile the raw results into a prompt for Gemini
    prompt = f"""
    You are an expert educational curator. A student wants to learn: "{topic}".
    I have performed three web searches for the best resources. Here is the raw data:

    Official Docs & Guides Search:
    {json.dumps(docs_results['results'])}

    Video Tutorials Search:
    {json.dumps(video_results['results'])}

    Roadmaps Search:
    {json.dumps(roadmap_results['results'])}

    Please synthesize this data into a curated list of the absolute best resources.
    Filter out any irrelevant or spammy links. Ensure you only return valid URLs from the raw data provided.
    Categorize the types as: 'docs', 'video', 'roadmap', or 'article'.

    Return the output ONLY as a JSON object matching this schema, with no markdown code block formatting (just raw JSON):
    {{
        "topic": "{topic}",
        "summary": "A 2-3 sentence motivational overview of what they are about to learn and why it's valuable.",
        "resources": [
            {{
                "title": "Resource Title",
                "url": "https://...",
                "description": "Why this resource is good (1 sentence)",
                "type": "video"
            }}
        ]
    }}
    """

    try:
        if not gemini_key:
            raise Exception("Missing Gemini Key")
        from google import genai
        gemini_client = genai.Client(api_key=gemini_key)
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        raw_output = response.text.strip()
    except Exception as e_gem:
        print(f"Gemini Synthesis Error: {e_gem}, falling back to Groq...")
        try:
            if not groq_key:
                raise Exception("Missing Groq Key")
            groq_client = Groq(api_key=groq_key)
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
            )
            raw_output = chat_completion.choices[0].message.content.strip()
        except Exception as e_groq:
            print(f"Groq Synthesis Error: {e_groq}")
            raw_output = None

    if raw_output:
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3]
        if raw_output.startswith("```"):
            raw_output = raw_output[3:-3]
            
        try:
            curated_data = json.loads(raw_output)
            return curated_data
        except Exception as e_json:
            print(f"JSON Parse Error: {e_json}")

    # Fallback if both AI fail or JSON parsing fails
    fallback_resources = []
    if docs_results.get("results"):
        doc = docs_results["results"][0]
        fallback_resources.append({
            "title": doc.get("title", f"{topic} Documentation"),
            "url": doc.get("url") or f"https://www.google.com/search?q={topic}+documentation",
            "description": doc.get("content", "Official guide.")[:100] + "...",
            "type": "docs"
        })
    if video_results.get("results"):
        vid = video_results["results"][0]
        fallback_resources.append({
            "title": vid.get("title", f"{topic} Tutorial"),
            "url": vid.get("url") or f"https://www.youtube.com/results?search_query={topic}+tutorial",
            "description": vid.get("content", "Video tutorial.")[:100] + "...",
            "type": "video"
        })
    if roadmap_results.get("results"):
        rm = roadmap_results["results"][0]
        fallback_resources.append({
            "title": rm.get("title", f"{topic} Roadmap"),
            "url": rm.get("url") or f"https://roadmap.sh/search?q={topic}",
            "description": rm.get("content", "Learning path.")[:100] + "...",
            "type": "roadmap"
        })
        
    if not fallback_resources:
        fallback_resources = [
            {
                "title": f"Getting Started with {topic}",
                "url": f"https://www.google.com/search?q={topic}+documentation",
                "description": "An excellent introductory guide.",
                "type": "docs"
            }
        ]

    return {
        "topic": topic,
        "summary": "Here are the top direct search results for your topic (AI synthesis currently unavailable).",
        "resources": fallback_resources
    }
class DeepReadRequest(BaseModel):
    url: str

class DeepReadResponse(BaseModel):
    summary: str
    key_takeaways: List[str]
    action_plan: str

@router.post("/deep-read", response_model=DeepReadResponse)
async def deep_read_article(
    request: DeepReadRequest,
    current_user: User = Depends(get_current_user),
):
    import httpx
    from dotenv import load_dotenv
    load_dotenv(override=True)
    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    if not gemini_key and not groq_key:
        raise HTTPException(status_code=500, detail="Missing AI API keys.")

    # 1. Fetch raw markdown from Jina Reader
    jina_url = f"https://r.jina.ai/{request.url}"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(jina_url)
            resp.raise_for_status()
            markdown_content = resp.text
    except Exception as e:
        print(f"Jina Reader Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to read the article via Jina.")

    # 2. Process with AI
    prompt = f"""
    You are an expert reading assistant. I am providing you with the full markdown content of a web article extracted by Jina Reader.
    
    Article Markdown:
    {markdown_content[:20000]} # Cap at 20k characters to avoid token limits

    Please analyze the article and provide:
    1. A concise summary.
    2. A list of 3-5 key takeaways.
    3. An actionable next step or mini action plan based on the content.

    Return the output ONLY as a JSON object matching this schema exactly, with NO markdown code block formatting:
    {{
        "summary": "String summarizing the article.",
        "key_takeaways": ["Takeaway 1", "Takeaway 2"],
        "action_plan": "Actionable next step based on the read."
    }}
    """
    
    raw_output = None

    try:
        if not gemini_key:
            raise Exception("Missing Gemini Key")
        from google import genai
        gemini_client = genai.Client(api_key=gemini_key)
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        raw_output = response.text.strip()
    except Exception as e_gem:
        print(f"Gemini Deep Read Error: {e_gem}, falling back to Groq...")
        try:
            if not groq_key:
                raise Exception("Missing Groq Key")
            groq_client = Groq(api_key=groq_key)
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            raw_output = chat_completion.choices[0].message.content.strip()
        except Exception as e_groq:
            print(f"Groq Deep Read Error: {e_groq}")
            raw_output = None

    if raw_output:
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3]
        if raw_output.startswith("```"):
            raw_output = raw_output[3:-3]
            
        try:
            data = json.loads(raw_output)
            return data
        except Exception as e_json:
            print(f"JSON Parse Error: {e_json}")

    # Return fallback mock data using actual markdown content from Jina
    
    import re
    
    lines = [line.strip() for line in markdown_content.split('\n') if line.strip()]
    
    # Extract text for summary
    text_lines = []
    for line in lines:
        if line.startswith(('#', '[', '!', '<', '>', 'URL Source:', 'Title:', 'Markdown Content:')):
            continue
        if 'skip to' in line.lower() or 'keyboard shortcuts' in line.lower() or '* [' in line:
            continue
        
        clean_line = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', line)
        
        if 'upgrade to microsoft edge' in clean_line.lower():
            continue
            
        if len(clean_line) > 50:
            text_lines.append(clean_line)
            
    summary = " ".join(text_lines[:2])[:400] + "..." if text_lines else "Could not extract a readable summary from this page."
    
    # Extract headers for key takeaways
    headers = []
    for line in lines:
        if line.startswith('#') and len(line) > 15:
            clean_header = line.lstrip('#* -').strip()
            # Remove markdown links: [text](url) -> text, and [](url) -> empty
            clean_header = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_header)
            # Remove bold/italic markers
            clean_header = clean_header.replace('**', '').replace('*', '').replace('__', '').strip()
            if clean_header and 'skip to' not in clean_header.lower() and 'shortcuts' not in clean_header.lower():
                headers.append(clean_header)
    
    # Or extract bullet points if no headers
    if not headers:
        for line in lines:
            if line.startswith(('-', '*')) and len(line) > 25:
                clean_bp = line.lstrip('* -').strip()
                clean_bp = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_bp)
                clean_bp = clean_bp.replace('**', '').replace('*', '').replace('__', '').strip()
                if clean_bp and not clean_bp.startswith('['): # avoid link lists
                    headers.append(clean_bp)
        
    takeaways = headers[:3] if headers else []
    default_takeaways = [
        "Explore the documentation linked.",
        "Review the core concepts.",
        "Practice the examples provided."
    ]
    
    while len(takeaways) < 3:
        takeaways.append(default_takeaways[len(takeaways)])

    return {
        "summary": f"(AI offline fallback) {summary}",
        "key_takeaways": takeaways[:3],
        "action_plan": "Visit the source URL to read the full article."
    }
