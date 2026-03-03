import os
import traceback
import getpass
from dotenv import load_dotenv
# from langchain_huggingface import HuggingFaceEndpoint
from langchain_groq import ChatGroq
from langchain_tavily import TavilyResearch
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv() 


# api_key = os.getenv("GROQ_API_KEY")
# if not api_key:
#     raise ValueError("GROQ_API_KEY not found in .env file.")


if "GROQ_API_KEY" not in os.environ:
    os.environ["GROQ_API_KEY"] = getpass.getpass("Enter your Groq API key: ")

# repo_id = "mistralai/Mistral-7B-Instruct-v0.3"
# repo_id = "google/flan-t5-base"

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.7,
    reasoning_format="parsed",
    max_retries=2
)



search_tool = TavilyResearch(
    max_results=5,
    topic="general"
)

parser = JsonOutputParser()

prompt = PromptTemplate(
    template="""You are an expert Research Assistant.
    Topic: {title}
    Search Results: {context}

    Instructions:
    1. Provide 3-4 highly relevant related topics.
    2. Extract and list the exact URL links from the Search Results provided. If no results, provide 2-3 reliable general links (like Wikipedia or official docs).
    3. List 5-6 technical keywords related to {title}.
    4. Provide a brief summary of what you found.

    {format_instructions}
    
    CRITICAL: You must return a valid JSON object. Do not return empty lists for 'web_links' and 'keywords'.
    """,
    input_variables=["title", "context"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)


chain = (
    RunnablePassthrough.assign(
        context=lambda x: search_tool.invoke(x["title"])
    )
    | prompt
    | llm
    | parser
)

def clean_ai_result(result):

    if "web_links" in result:
        result["web_links"] = [w for w in result["web_links"] if isinstance(w, str)]

    if "keywords" not in result or result["keywords"] is None:
        result["keywords"] = []

    return result


def generate_ai_content(user_title: str):
    try:
        result = chain.invoke({"title": user_title})
        print(f"DEBUG - Tavily Results: {result}")
        ai_result = clean_ai_result(result)
        return ai_result
    except Exception as e:
        print(f"Error generating content: {e}")
        traceback.print_exc()
        return {"error": str(e) or "Unknown AI error..!"}
        # return {"related_topics": [],"web_links": [], "keywords": []}