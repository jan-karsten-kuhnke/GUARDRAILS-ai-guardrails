import requests
from functools import lru_cache
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
tokenizer = None
model = None
import logging
class NSFWModelWrapper:
    
    def init_model():
        global tokenizer
        global model
        if tokenizer is None:
            logging.info("Initializing tokenizer and model")
            tokenizer = AutoTokenizer.from_pretrained("michellejieli/NSFW_text_classifier")
        if model is None:
            model = AutoModelForSequenceClassification.from_pretrained("michellejieli/NSFW_text_classifier")
            model.eval()

    @lru_cache(maxsize=32)
    def analyze(message):
        global tokenizer
        global model
        NSFWModelWrapper.init_model()
        inputs = tokenizer(message, truncation=True, padding=True, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
        prediction_scores = outputs.logits
        probabilities = torch.softmax(prediction_scores, dim=1).squeeze()
        logging.info(float (probabilities[1]))
        return(float (probabilities[1]))
