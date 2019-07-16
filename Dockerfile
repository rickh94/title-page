FROM kennethreitz/pipenv

RUN apt-get -y update
RUN apt-get -y install build-essential python3-dev python3-cffi \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 \
    libffi-dev shared-mime-info

ADD . /app
RUN mkdir -p ~/.local/share/fonts
RUN unzip Cormorant_Garamond.zip
RUN mv *.ttf ~/.local/share/fonts
RUN fc-cache -f

WORKDIR /app

CMD uvicorn --host '0.0.0.0' --port 80 title_page:app
