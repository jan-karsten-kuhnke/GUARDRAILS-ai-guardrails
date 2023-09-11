from langchain.document_loaders.parsers.pdf import (
    PyPDFParser
)
import os
import fitz  # PyMuPDF
from typing import Optional, List, Union
from google.cloud import documentai_v1 as documentai
from langchain.docstore.document import Document
import logging
from PIL import Image
import io

class DocumentAILoader:

    # Get the current directory where your Python script is located.
    current_directory = os.path.dirname(os.path.abspath(__file__))
    
    # Construct the full path to your JSON key file.
    key_file_path = os.path.join(current_directory, "bonedge-ml-e1153ee50759.json")
    
    # Set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_file_path
    
    def __init__(
        self, file_path: str, 
        project_id: str,
        processor_id: str,
        ocrprocessor_id: str, 
        password: Optional[Union[str, bytes]] = None
    ) -> None:
        """Initialize with a file path."""
        self.file_path = file_path
        self.project_id = project_id
        self.processor_id = processor_id
        self.ocrprocessor_id = ocrprocessor_id

        try:
            import pypdf  # noqa:F401
        except ImportError:
            raise ImportError(
                "pypdf package not found, please install it with " "`pip install pypdf`"
            )
        self.parser = PyPDFParser(password=password)

    def load(self) -> List[Document]:
        
        pdf_document = fitz.open(self.file_path)
        docs = []
        for page_number in range(pdf_document.page_count):
            page = pdf_document.load_page(page_number)
            image_matrix = page.get_pixmap() # render page to an image
            
            # Convert pixmap to bytes
            image_bytes = self.convert_pixmap_to_bytes(image_matrix)
            roothtml = self.process_document(image_bytes)
            
            docs.append(Document(metadata={"source": self.file_path, "page_number": page_number + 1}, page_content=roothtml))
        return docs
    
    def convert_pixmap_to_bytes(self, pixmap):
        # Create a Pillow Image from the pixmap 
        img = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)

        # Create an in-memory binary stream and save the image as bytes
        output = io.BytesIO()
        img.save(output, format="JPEG")  # You can use other formats like PNG as needed
        image_bytes = output.getvalue()
        output.close()

        return image_bytes

    def process_document(self, image_data):
        roothtml = ""
        # Initialize the Document AI client
        client = documentai.DocumentProcessorServiceClient()
        # Specify the processor, project, and location
        formname = f"projects/{self.project_id}/locations/us/processors/{self.processor_id}"
        ocrname = f"projects/{self.project_id}/locations/us/processors/{self.ocrprocessor_id}"

        fdocument = {"content": image_data, "mime_type": "image/png"}
        
        request = {"name": formname, "raw_document": fdocument}
        ocrrequest = {"name": ocrname, "raw_document": fdocument}
        
        formresult = client.process_document(request=request)
        ocrresult = client.process_document(request=ocrrequest)

        # Read the document and parse tables
        formdocument = formresult.document
        ocrdocument = ocrresult.document
        roothtml = self.extract_and_save_text(formdocument,ocrdocument)

        return roothtml
        
    
    def extract_and_save_text(self, inpdocument,ocrdocument):
        # Initialize a list to store paragraphs and tables along with their bounding box info
        elements = []
        roothtml = ""
        table_boxes = []  # Initialize the list to store table bounding boxes
        
        for page in inpdocument.pages:
            for table in page.tables:
                vertices = [(vertex.x, vertex.y) for vertex in table.layout.bounding_poly.vertices]
                start_point = vertices[0]
                end_point = vertices[2]

                # Store table bounding box
                table_boxes.append([start_point[0], start_point[1], end_point[0], end_point[1]])

                start_idx = table.layout.text_anchor.text_segments[0].start_index
                end_idx = table.layout.text_anchor.text_segments[0].end_index

                elements.append({
                    'type': 'table',
                    'text': self.construct_html_table(table,inpdocument.text),
                    'y': start_point[1]
                })
        for page in ocrdocument.pages:
            for paragraph in page.tokens:
                vertices = [(int(vertex.x*page.image.width), int(vertex.y*page.image.height)) for vertex in paragraph.layout.bounding_poly.normalized_vertices]
                start_point = vertices[0]
                end_point = vertices[2]

                para_box = [start_point[0], start_point[1], end_point[0], end_point[1]]

                if any(self.is_contained(para_box, table_box) for table_box in table_boxes):
                    continue  # Skip this paragraph

                start_idx = paragraph.layout.text_anchor.text_segments[0].start_index
                end_idx = paragraph.layout.text_anchor.text_segments[0].end_index
                para_text = ocrdocument.text[start_idx:end_idx]

                elements.append({
                    'type': 'paragraph',
                    'text': para_text,
                    'y': start_point[1]
                })

        # Sort the list based on the y-coordinate to maintain the order
        elements.sort(key=lambda x: x['y'])

        for item in elements : 
            roothtml += f"{item['text']}\n"
        
        return roothtml
    
    def construct_html_table(self, json_response, text):
        # Initialize HTML table
        html_table = '<table border="1">'

        # Add header rows
        html_table += '<thead>'
        for header_row in json_response.header_rows:
            html_table += '<tr>'
            for cell in header_row.cells:
                text_anchor = cell.layout.text_anchor
                cell_text = ""
                for text_segment in text_anchor.text_segments:
                    start_index = text_segment.start_index
                    end_index = text_segment.end_index
                    cell_text += text[start_index:end_index]
                html_table += f'<th>{cell_text}</th>'
            html_table += '</tr>'
        html_table += '</thead>'

        # Add body rows
        html_table += '<tbody>'
        for body_row in json_response.body_rows:
            html_table += '<tr>'
            for cell in body_row.cells:
                text_anchor = cell.layout.text_anchor
                cell_text = ""
                for text_segment in text_anchor.text_segments:
                    start_index = text_segment.start_index
                    end_index = text_segment.end_index
                    cell_text += text[start_index:end_index]
                html_table += f'<td>{cell_text}</td>'
            html_table += '</tr>'
        html_table += '</tbody>'

        # Close HTML table
        html_table += '</table>'

        return html_table
    
    def is_contained(self, box1, box2):

        return box2[0] <= box1[0] and box2[1] <= box1[1] and box1[2] <= box2[2] and box1[3] <= box2[3]

    

