# syntax=docker/dockerfile:1

FROM --platform=linux/amd64 python:3.11.4-slim-bullseye


WORKDIR /python-docker


RUN pip3 install pipenv
RUN pipenv install sentence-transformers==2.2.2
RUN apt-get update && apt-get install -y build-essential
COPY Pipfile .
RUN pipenv install
RUN pipenv run python3 -m spacy download en_core_web_lg
RUN pipenv run pip3 install itsdangerous==2.0.1
RUN pipenv run pip3 install sqlalchemy==2.0.16
RUN pipenv run pip3 uninstall -y httpx
COPY . .

CMD ["pipenv", "run", "start"]
EXPOSE 8080