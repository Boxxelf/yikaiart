"""Build the printable owner guide with ReportLab; not part of the website build."""
import json, os, shutil
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether
from reportlab.lib.pagesizes import A4
root=Path(__file__).resolve().parents[2]
pages=json.loads((root/'docs/works-upload/guide-content.json').read_text())
font=os.environ.get('GUIDE_FONT','/Library/Fonts/Arial Unicode.ttf')
pdfmetrics.registerFont(TTFont('Guide',font))
ink=colors.HexColor('#24201c'); red=colors.HexColor('#773024'); muted=colors.HexColor('#625d55')
styles={
 'body':ParagraphStyle('body',fontName='Guide',fontSize=18,leading=29,textColor=ink,spaceAfter=13,wordWrap='CJK'),
 'title':ParagraphStyle('title',fontName='Guide',fontSize=29,leading=40,textColor=ink,spaceAfter=9,wordWrap='CJK'),
 'sub':ParagraphStyle('sub',fontName='Guide',fontSize=14,leading=23,textColor=muted,spaceAfter=24,wordWrap='CJK'),
 'h':ParagraphStyle('h',fontName='Guide',fontSize=20,leading=30,textColor=red,spaceBefore=9,spaceAfter=7,wordWrap='CJK'),
 'small':ParagraphStyle('small',fontName='Guide',fontSize=12,leading=19,textColor=muted,spaceAfter=8,wordWrap='CJK'),
 'lead':ParagraphStyle('lead',fontName='Guide',fontSize=22,leading=34,textColor=red,spaceAfter=20,wordWrap='CJK'),
 'link':ParagraphStyle('link',fontName='Guide',fontSize=17,leading=26,textColor=red,spaceAfter=5,wordWrap='CJK'),
 'url':ParagraphStyle('url',fontName='Guide',fontSize=12,leading=19,textColor=muted,spaceAfter=15,wordWrap='CJK'),
 'table':ParagraphStyle('table',fontName='Guide',fontSize=16,leading=24,textColor=ink,wordWrap='CJK'),
}
def para(text, style='body'): return Paragraph(escape(text).replace('\n','<br/>'), styles[style])
flow=[];md=['# YI KAI 作品上传操作说明\n\n大字号 PDF 同步发布于 https://www.yikaistudio.com/manuals/works-upload-guide.pdf\n']
for index,page in enumerate(pages):
 if index:flow.append(PageBreak())
 flow.extend([para(page['title'],'title'),para(page['subtitle'],'sub')]);md.append('\n## '+page['title']+'\n\n'+page['subtitle']+'\n')
 for block in page['blocks']:
  kind=block[0]
  if kind in ['p','h','lead','small']:
   flow.append(para(block[1], 'body' if kind=='p' else kind));md.append(('### ' if kind=='h' else '')+block[1]+'\n')
  elif kind=='n':
   flow.append(para(block[1]+'. '+block[2]));md.append(block[1]+'. '+block[2]+'\n')
  elif kind=='note':
   box=Table([[para(block[1])]],colWidths=[487]);box.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#f0e9df')),('LEFTPADDING',(0,0),(-1,-1),15),('RIGHTPADDING',(0,0),(-1,-1),15),('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),2)]));flow.extend([box,Spacer(1,16)]);md.append('> '+block[1]+'\n')
  elif kind in ['link','source']:
   label,url=block[1:];sty='link' if kind=='link' else 'small'
   content=[Paragraph('<link href="'+escape(url)+'" color="#773024">'+escape(label)+'</link>', styles[sty])]
   if kind=='link':content.append(para(url,'url'))
   flow.append(KeepTogether(content));md.append('['+label+']('+url+')\n')
  elif kind=='table':
   table=Table([[para(cell,'table') for cell in row] for row in block[1]],colWidths=[174,313]);table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#ece3d7')),('LINEBELOW',(0,0),(-1,-1),.5,colors.HexColor('#d1c5b6')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10)]));flow.extend([table,Spacer(1,20)]);md.append('\n'.join('| '+' | '.join(row)+' |'+('\n| --- | --- |' if i==0 else '') for i,row in enumerate(block[1]))+'\n')
output=root/'output/pdf';output.mkdir(parents=True,exist_ok=True)
path=output/'YIKAI-作品上传操作手册.pdf'
def footer(canvas,doc):
 canvas.setStrokeColor(colors.HexColor('#d1c5b6'));canvas.line(54,45,541,45);canvas.setFont('Guide',10);canvas.setFillColor(muted);canvas.drawString(54,29,'YI KAI  /  作品上传操作手册');canvas.drawRightString(541,29,f'{doc.page} / {len(pages)}')
doc=SimpleDocTemplate(str(path),pagesize=A4,rightMargin=54,leftMargin=54,topMargin=45,bottomMargin=65,title='YI KAI 作品上传操作手册',author='YI KAI Studio',pageCompression=1)
doc.build(flow,onFirstPage=footer,onLaterPages=footer)
(root/'docs/works-upload/操作说明.md').write_text('\n'.join(md))
from pypdf import PdfReader
assert len(PdfReader(path).pages) == len(pages), 'A guide section overflowed: fix pagination before publication.'
public=root/'public/manuals';public.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,public/'works-upload-guide.pdf')
print(path)
