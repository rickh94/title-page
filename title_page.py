import tempfile
from pathlib import Path
from typing import List, Optional

import jinja2
import random
import weasyprint
import weasyprint.fonts
from fastapi import FastAPI, Body
from pydantic import BaseModel
from starlette.responses import HTMLResponse
from starlette.staticfiles import StaticFiles

app = FastAPI(title="Music Title Pages", version="19.7.1")


class Piece(BaseModel):
    title: str
    composers: List[str]
    part: str
    extra_info: Optional[List[str]] = None
    part_additional: Optional[str] = ""


class Output(BaseModel):
    url: str


piece_example = {
    "title": "Symphony No. 5",
    "composers": ["Ludwig van Beethoven"],
    "part": "Violin I",
    "extra_info": ["in C minor"],
}

PDF_PATH = Path("/") / Path("srv/media")
PDF_PATH.mkdir(parents=True, exist_ok=True)

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
    )
    random_num = "".join(random.choice("0123456789abcdef") for _ in range(4))
    file_name = (
        random_num
        + "_"
        + piece.title.lower().replace(" ", "_").replace("/", "_")
        + "_title_page"
    )
    tmp_dir = Path(tempfile.mkdtemp())
    html_path = tmp_dir / f"{file_name}.html"
    pdf_path = PDF_PATH / f"{file_name}.pdf"
    with html_path.open("w") as html_file:
        html_file.write(html)
    to_pdf(html_path, pdf_path)

    return {"url": f"/media/{file_name}.pdf"}


def render_html(title, composers, part, extra_info=None, part_additional=""):
    if not extra_info:
        extra_info = []
    env = jinja2.Environment(
        loader=jinja2.PackageLoader("title_page", "templates"),
        autoescape=jinja2.select_autoescape(["html"]),
    )

    template = env.get_template("title_page.html")
    return template.render(
        title=title,
        composers=composers,
        extra_info=extra_info,
        part_additional=part_additional,
        part=part,
    )


def to_pdf(in_path, out_path):
    weasyprint.HTML(filename=str(in_path)).write_pdf(str(out_path))


# if __name__ == "__main__":
#     with open("test.html", "w") as out_file:
#         out_file.write(
#             render_html(
#                 title="Shaker",
#                 composers=["Kevin Sylvester", "Wilner Baptiste"],
#                 part="Viola",
#                 extra_info=[
#                     "arr. Seth Truby & Mark Woodward",
#                     "For youth orchestra and piano",
#                     "From the album Stereotypes, Black Violin, 2015",
#                     'Based on variations of "Simple Gifts" by Joseph Brackett',
#                 ],
#             )
#         )
#     new_to_pdf(Path("test.html"), Path("test.pdf"))
