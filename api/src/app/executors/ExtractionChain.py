from globals import Globals 

from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chat_models import ChatOpenAI,ChatVertexAI


from globals import Globals
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.summarize import load_summarize_chain

from langchain.chat_models import ChatOpenAI
from langchain.chains import create_extraction_chain

class ExtractionChain:
    def execute(self,filepath):
        loader = PyPDFLoader(filepath)
        pages = loader.load_and_split()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        docs = text_splitter.split_documents(pages)
        all_content = ""

        for doc in docs:
            all_content += doc.page_content

        schema = {
            "properties": {
                "SiteArea": {"type": "string"},
                "MaximumBuildingHeight": {"type": "string"},
                "GrossPlotRatio": {"type": "integer"},
                "totalApartmentCount": {"type": "integer"},
                "OneRoomApartmentPercentage": {"type": "string"},
                "TwoRoomApartmentPercentage": {"type": "string"},
                "ThreeRoomApartmentPercentage": {"type": "string"},
                "FourRoomApartmentPercentage": {"type": "string"},
            },
            "required": ["SiteArea", "MaximumBuildingHeight", "GrossPlotRatio", "totalApartmentCount", "OneRoomApartmentPercentage", "TwoRoomApartmentPercentage", "ThreeRoomApartmentPercentage", "FourRoomApartmentPercentage"],
        }
        llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k",max_tokens=1000)

        chain = create_extraction_chain(schema=schema, llm=llm)

        result = chain.run(all_content)


        answer = result[0]
        sources = []
        return {"answer": answer, "sources": sources}

