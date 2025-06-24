import os
from google import genai
from dotenv import load_dotenv
import time
import random

def GetResponse(prompt, max_retries = 3):
    load_dotenv()
    token = os.environ["OPENAI_KEY"]
    client = genai.Client(api_key=token)
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash", contents=prompt
            )
            return response.text
        except Exception as e:
            if "503" in str(e) or "overloaded" in str(e).lower():
                if attempt < max_retries - 1:
                    wait_time = (2**attempt) + random.uniform(0, 1)
                    time.sleep(wait_time)
                    continue
            raise e
    
    return "Service temporarily unavailable. Please try again"

if __name__ == "__main__":
    prompt = input("Enter the prompt: ")
    print(GetResponse(prompt))