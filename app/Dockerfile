FROM kennethreitz/pipenv

RUN apt-get -y update
RUN apt-get -y install build-essential python3-dev python3-cffi \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 \
    libffi-dev shared-mime-info curl

RUN mkdir -p ~/.local/share/fonts
RUN curl -L https://fonts.google.com/download?family=Cormorant%20Garamond -o Cormorant_Garamond.zip
RUN unzip -o Cormorant_Garamond.zip '*.ttf'
RUN curl -L https://fonts.google.com/download?family=Open%20Sans -o Open_Sans.zip
RUN unzip -o Open_Sans.zip '*.ttf'
RUN curl -L https://fonts.google.com/download?family=Montserrat -o Montserrat.zip
RUN unzip -o Montserrat.zip '*.ttf'
RUN curl -L https://fonts.google.com/download?family=PT%20Serif -o PT_Serif.zip
RUN unzip -o PT_Serif.zip '*.ttf'
RUN curl -L https://fonts.google.com/download?family=Libre%20Baskerville -o librebaskerville.zip
RUN unzip -o librebaskerville.zip '*.ttf'
RUN curl -L https://fonts.google.com/download?family=Amiri -o amiri.zip
RUN unzip -o amiri.zip '*.ttf'
RUN mv *.ttf ~/.local/share/fonts
RUN fc-cache -f
ADD ./title_page.py /app
ADD ./__init__.py /app
ADD ./templates /app/templates
ADD ./frontend/dist /app/frontend/dist

WORKDIR /app

CMD uvicorn --host '0.0.0.0' --port 80 title_page:app
