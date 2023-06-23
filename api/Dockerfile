# syntax=docker/dockerfile:1

FROM --platform=linux/amd64 python:3.11-slim-buster


WORKDIR /python-docker

COPY Pipfile .
RUN pip3 install pipenv
RUN pipenv install
RUN pipenv run python3 -m spacy download en_core_web_lg
RUN pipenv run pip3 install torch
COPY . .

CMD ["pipenv", "run", "start"]
EXPOSE 8080