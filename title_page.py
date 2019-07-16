import json
import os
import tempfile
from pathlib import Path

import boto3
import jinja2
import pdfkit
import weasyprint
import weasyprint.fonts


def main(event, _context):
    data = json.loads(event["body"])
    html = render_html(
        title=data.get("title"),
        composers=data.get("composers"),
        part=data.get("part"),
        extra_info=data.get("extra_info", None),
        part_additional=data.get("part_additional", ""),
    )
    file_name = data.get("title").lower().replace(" ", "_") + "_title_page"
    tmp_dir = Path(tempfile.mkdtemp())
    html_path = tmp_dir / f"{file_name}.html"
    pdf_path = tmp_dir / f"{file_name}.pdf"
    with html_path.open("w") as html_file:
        html_file.write(html)
    new_to_pdf(html_path, pdf_path)

    s3 = boto3.client("s3")
    bucket = os.getenv("BUCKET_NAME")
    s3.upload_file(str(pdf_path), Key=str(pdf_path.name), Bucket=bucket)
    # s3.upload_file(str(html_path), Key=str(html_path.name), Bucket=bucket)
    url = s3.generate_presigned_url(
        "get_object", Params={"Key": str(pdf_path.name), "Bucket": bucket}
    )
    # url = s3.generate_presigned_url(
    #     "get_object", Params={"Key": str(html_path.name), "Bucket": bucket}
    # )

    return {"statusCode": 200, "download_file": url}


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
    here = Path(__file__)
    base = here.parent
    wkhtmltopdf_path = base / "binary" / "wkhtmltopdf"
    config = pdfkit.configuration(wkhtmltopdf=str(wkhtmltopdf_path))
    pdfkit.from_file(str(in_path), str(out_path), configuration=config)


def new_to_pdf(in_path, out_path):
    font_config = weasyprint.fonts.FontConfiguration()
    here = Path(__file__).parent.absolute() / "templates"
    css = weasyprint.CSS(
        string=(
            "@font-face {"
            "   font-family: 'Cormorant Garamond';"
            f"   src: url(file://{here}/CormorantGaramond-Regular.ttf);"
            "}"
        ),
        font_config=font_config,
    )
    weasyprint.HTML(filename=str(in_path)).write_pdf(
        str(out_path), font_config=font_config, stylesheets=[css]
    )


if __name__ == "__main__":
    with open("test.html", "w") as out_file:
        out_file.write(
            render_html(
                title="Shaker",
                composers=["Kevin Sylvester", "Wilner Baptiste"],
                part="Viola",
                extra_info=[
                    "arr. Seth Truby & Mark Woodward",
                    "For youth orchestra and piano",
                    "From the album Stereotypes, Black Violin, 2015",
                    'Based on variations of "Simple Gifts" by Joseph Brackett',
                ],
            )
        )
    new_to_pdf(Path("test.html"), Path("test.pdf"))
