import os
from google import genai
from dotenv import load_dotenv

def GetResponse(prompt):
    load_dotenv()
    token = os.environ["OPENAI_KEY"]
    client = genai.Client(api_key=token)
    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=prompt
    )
    return response.text