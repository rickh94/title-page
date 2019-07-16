FROM kennethreitz/pipenv

ADD . /app
ENV PDFKIT_PATH '/app/binary/wkhtmltopdf'

RUN chmod +x /app/binary/wkhtmltopdf
CMD python3 /app/title_page.py
