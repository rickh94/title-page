FROM kennethreitz/pipenv

ADD . /app

WORKDIR /app

CMD uvicorn --host '0.0.0.0' --port 80 title_page:app
