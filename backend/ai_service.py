import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpoint
from langchain_tavily import TavilyResearch
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv() 


api_key = os.getenv("HUGGINGFACEHUB_API_TOKEN")
if not api_key:
    raise ValueError("HUGGINGFACEHUB_API_TOKEN not found in .env file.")

repo_id = "mistralai/Mistral-7B-Instruct-v0.3"

llm = HuggingFaceEndpoint(
    model=repo_id,
    huggingfacehub_api_token=api_key,
    temperature=0.7,
    max_new_tokens=500
)


search_tool = TavilyResearch(
    max_results=5,
    topic="general"
)

parser = JsonOutputParser()

prompt = PromptTemplate(
    template="""You are a Research Assistant.
    Topic: {title}
    Search Results: {context}

    Based on the topic and search results, provide:
    1. 3-4 related topics for further study.
    2. The most relevant web links from the search results.
    3. 5-6 technical keywords regarding the topic.

    {format_instructions}
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


def generate_ai_content(user_title: str):
    try:
        result = chain.invoke({"title": user_title})
        return result
    except Exception as e:
        print(f"Errorgenerating content: {e}")
        return {"error": str(e)}
        # return {"related_topics": [],"web_links": [], "keywords": []}