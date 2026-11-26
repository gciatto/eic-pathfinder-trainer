#!/usr/bin/env python3
"""Extract official EIC Pathfinder Challenges 2026 quizzes from supplied PDFs.

Does not invent or paraphrase any question/answer text; whitespace is normalized.
"""
import json,re,pathlib,sys,subprocess
ROOT=pathlib.Path(__file__).resolve().parent
SRC=ROOT/'source_extract'
PDF_DIR=ROOT/'materials'
FILES={
 'A': ('EIC_Pathfinder_Part_A_Questions.txt','General Overview',13),
 'B': ('EIC_Pathfinder_Part_B_Questions.txt','Guidance for IER and CR',20),
 'C': ('EIC_Pathfinder_Part_C_Questions.txt','Additional Questions and Lump Sum Budget',11),
 'D': ('EIC_Pathfinder_Part_D_Questions.txt','Vice Chairs Rapporteurs',16),
 'E': ('EIC_Pathfinder_VCPs_Questions.txt','VCPs – Individual Evaluation and Portfolio Building',14),
}
EXPECTED={
 'A':['E','B','E','D','A','B','D','B','E','D','B','E','B'],
 'B':['D','A','A','B','B','B','A','A','C','C','C','C','B','B','B','BD','C','E','D','B'],
 'C':['B','B','A','A','B','C','A','B','D','A','A'],
 'D':['D','A','B','A','B','A','B','D','A','C','E','B','B','C','C','D'],
 'E':['E','B','E','D','A','B','D','B','E','A','E','C','B','E'],
}
QUESTION_RE=re.compile(r'^\s*(\d{1,2})\.\s+(.+?)\s*$')
OPT_RE=re.compile(r'^\s+([A-E])\.\s+(.+?)\s*$')
ANS_RE=re.compile(r'^\s*(\d{1,2})\.\s+([A-E])\.\s+(.+?)\s*$')
SEC_RE=re.compile(r'^(Part ([A-D]) –|VCPs –)')

def norm(s):
    return re.sub(r'\s+',' ',s).strip()

def parse_quiz(txt):
    lines=txt.splitlines(keepends=True)
    page=1
    questions=[];current=None;field=None
    for raw in lines:
        npage=raw.count('\f'); line=raw.replace('\f','').rstrip('\r\n')
        q=QUESTION_RE.match(line)
        o=OPT_RE.match(line)
        if q:
            if current:questions.append(current)
            number=int(q.group(1));current={'number':number,'question':q.group(2).strip(),'options':{},'sourcePage':page}
            field='question'
        elif o and current:
            k=o.group(1)
            if k in current['options']:raise ValueError(f'duplicate option: {current["number"]} {k}')
            current['options'][k]=o.group(2).strip();field=k
        elif current and line.strip():
            if field=='question':current['question']+=' '+line.strip()
            elif field in current['options']:current['options'][field]+=' '+line.strip()
        page+=npage
    if current:questions.append(current)
    for q in questions:
        q['question']=norm(q['question']);q['options']={k:norm(v) for k,v in q['options'].items()}
    return questions

def parse_answer_sheet(txt):
    result={};part=None;page=1;last_nr=None
    for raw in txt.splitlines(keepends=True):
        increment=raw.count('\f');s=raw.replace('\f','').strip()
        header=SEC_RE.match(s)
        if header:
            part=header.group(2) or 'E'
            result[part]={};last_nr=None
        else:
            m=ANS_RE.match(s)
            if m and part:
                nr=int(m.group(1));result[part][nr]={'answers':[m.group(2)],'text':[m.group(3)],'page':page};last_nr=nr
            elif part=='B' and last_nr==16 and s.startswith('D. ') and len(result['B'][16]['answers'])==1:
                result['B'][16]['answers'].append('D');result['B'][16]['text'].append(s[3:])
            elif part and last_nr is not None and s:
                result[part][last_nr]['text'][-1] += ' '+s
        page+=increment
    return result

def main():
    SRC.mkdir(parents=True,exist_ok=True)
    for pdf in ['EIC_Pathfinder_Part_A_Questions.pdf','EIC_Pathfinder_Part_B_Questions.pdf','EIC_Pathfinder_Part_C_Questions.pdf','EIC_Pathfinder_Part_D_Questions.pdf','EIC_Pathfinder_VCPs_Questions.pdf','EIC_Pathfinder_Consolidated_Answers.pdf']:
        output=SRC/(pathlib.Path(pdf).stem+'.txt')
        if not output.exists():
            subprocess.run(['pdftotext','-layout',str(PDF_DIR/pdf),str(output)],check=True)
    answers=parse_answer_sheet((SRC/'EIC_Pathfinder_Consolidated_Answers.txt').read_text())
    bank=[]
    for part,(filename,title,expected_count) in FILES.items():
        quiz=parse_quiz((SRC/filename).read_text())
        assert len(quiz)==expected_count,(part,len(quiz),expected_count)
        assert len(answers[part])==expected_count,(part,len(answers[part]))
        assert [q['number'] for q in quiz]==list(range(1,expected_count+1)),part
        for q in quiz:
            i=q['number'];a=answers[part][i]
            assert ''.join(a['answers'])==EXPECTED[part][i-1],(part,i,a['answers'],EXPECTED[part][i-1])
            assert sorted(q['options'])==list('ABCDE'[:len(q['options'])]),(part,i,q['options'])
            assert all(k in q['options'] for k in a['answers']),(part,i,a)
            for k, official_text in zip(a['answers'], a['text']):
                actual=norm(q['options'][k]);expected=norm(official_text)
                if actual != expected:
                    import difflib
                    similarity=difflib.SequenceMatcher(None, actual, expected).ratio()
                    assert similarity>0.93, (part,i,k,round(similarity,3),actual,expected)
            q.update(id=f'{part}-{i:02}',part=part,title=title,answers=a['answers'],answerPage=a['page'],answerText=[norm(x) for x in a['text']])
            bank.append(q)
    assert len(bank)==74
    print('By section:',[(p,sum(q['part']==p for q in bank)) for p in FILES]);print('Multi-select:',[(q['id'],q['answers']) for q in bank if len(q['answers'])>1]);print('Sample:')
    for k in ['A-01','B-16','C-09','D-16','E-14']:
        q=next(q for q in bank if q['id']==k)
        print(k,q['question'][:80],q['answers'],[q['options'][a][:80] for a in q['answers']])
    (ROOT/'questions.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'questions.js').write_text('"use strict";\nwindow.OFFICIAL_QUIZZES='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+';\n')

if __name__=='__main__':main()
