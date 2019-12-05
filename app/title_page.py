import os
import tempfile
import uuid
from pathlib import Path
from typing import List, Optional

import PyPDF2
import jinja2
import weasyprint
import weasyprint.fonts
from fastapi import FastAPI, Body, UploadFile, File, Form
from pydantic import BaseModel
from starlette.responses import HTMLResponse
from starlette.staticfiles import StaticFiles

app = FastAPI(title="Music Title Pages", version="19.7.1")


class Piece(BaseModel):
    font: str = "Cormorant Garamond"
    title: str
    composers: List[str]
    part: str
    extra_info: Optional[List[str]] = None
    part_additional: Optional[str] = ""


class Output(BaseModel):
    url: str
    filename: str


piece_example = {
    "title": "Symphony No. 5",
    "composers": ["Ludwig van Beethoven"],
    "part": "Violin I",
    "extra_info": ["in C minor"],
}

PDF_PATH = Path("/") / Path("srv/media")
PDF_PATH.mkdir(parents=True, exist_ok=True)
COMPLETIONS_PATH = Path("/") / "completions"

app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")
app.mount("/media", StaticFiles(directory=str(PDF_PATH)), name="pdfs")


@app.get("/", response_class=HTMLResponse)
def form():
    frontend = Path(__file__).parent.absolute() / "frontend"
    form_file = frontend / "dist" / "index.html"
    with form_file.open("r") as html_file:
        html = html_file.read()
    return HTMLResponse(html)


@app.post("/generate", response_model=Output)
def create(piece: Piece = Body(..., example=piece_example)):
    html = render_html(
        title=piece.title,
        composers=piece.composers,
        part=piece.part,
        extra_info=piece.extra_info,
        part_additional=piece.part_additional,
        font=piece.font,
    )
    add_composer_completions(piece.composers)
    file_name = uuid.uuid4()
    tmp_dir = Path(tempfile.mkdtemp())
    html_path = tmp_dir / f"{file_name}.html"
    tmp_pdf_path = tmp_dir / f"{file_name}.pdf"
    pdf_path = PDF_PATH / f"{file_name}.pdf"
    with html_path.open("w") as html_file:
        html_file.write(html)
    to_pdf(html_path, tmp_pdf_path)

    rendered_pdf_file = tmp_pdf_path.open("rb")
    final_pdf_file = pdf_path.open("wb")
    writer = PyPDF2.PdfFileWriter()
    reader = PyPDF2.PdfFileReader(rendered_pdf_file)

    writer.appendPagesFromReader(reader)
    writer.addMetadata(
        {
            "/Title": f"{piece.title} ({piece.part})",
            "/Author": ", ".join(piece.composers),
        }
    )
    writer.write(final_pdf_file)

    rendered_pdf_file.close()
    final_pdf_file.close()
    os.remove(tmp_pdf_path)

    return Output(url=f"/media/{file_name}.pdf", filename=f"{file_name}.pdf")


@app.post("/combine", response_model=Output)
async def combine(file: UploadFile = File(...), title_page_filename: str = Form(...)):
    tmp_upload = tempfile.TemporaryFile()
    tmp_upload.write(await file.read())
    title_page_path = PDF_PATH / title_page_filename

    merged_pdf = PyPDF2.PdfFileMerger()

    merged_pdf.append(str(title_page_path.absolute()))
    merged_pdf.append(tmp_upload)

    with title_page_path.open("rb") as tp_file:
        reader = PyPDF2.PdfFileReader(tp_file)
        merged_pdf.addMetadata(reader.getDocumentInfo())

    output_pdf_path = PDF_PATH / file.filename
    with output_pdf_path.open("wb") as output_file:
        merged_pdf.write(output_file)

    return Output(url=f"/media/{output_pdf_path.name}", filename=f"{file.filename}")


@app.get("/completions/composers", response_model=List[str])
async def get_composer_completions():
    return get_composer_completions()


def render_html(title, composers, part, font, extra_info=None, part_additional=""):
    if not extra_info:
        extra_info = []
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(Path(__file__).parent / "templates")),
        autoescape=jinja2.select_autoescape(["html"]),
    )

    template = env.get_template("title_page.html")
    return template.render(
        title=title,
        composers=composers,
        extra_info=extra_info,
        part_additional=part_additional,
        part=part,
        font=font,
    )


def to_pdf(in_path, out_path):
    weasyprint.HTML(filename=str(in_path)).write_pdf(str(out_path))


def add_composer_completions(new_composers: List[str]):
    composer_completions_path = COMPLETIONS_PATH / "composers.txt"
    composers = set(get_composer_completions())

    for new_composer in new_composers:
        composers.add(new_composer)

    with composer_completions_path.open("w") as composer_completions_file:
        composer_completions_file.write("\n".join(composers))


def get_composer_completions() -> List[str]:
    COMPLETIONS_PATH.mkdir(exist_ok=True)
    composer_completions_path = COMPLETIONS_PATH / "composers.txt"
    if not composer_completions_path.exists():
        return []
    with composer_completions_path.open("r") as composer_completions_file:
        composers = composer_completions_file.read()

    return composers.split("\n")
