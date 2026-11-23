# Оборачивает русские строки в T(...) для перевода. Запуск: python3 tools/i18n_wrap.py public/js/<файл>.js ...
# Оборачивает русские строки JS в T(...). Строки '..'/".." -> T('..'); в шаблонах `..` текст между тегами
# и значения атрибутов -> ${T("..")}. Комментарии и регулярные выражения не трогает.
import re, sys, json
CYR=re.compile('[А-Яа-яЁё]')
KW=('return','typeof','case','do','else','in','of','void','yield','await')
def js_str(s): return json.dumps(s,ensure_ascii=False)
def wrap_quoted(raw, q):
    body=raw[1:-1]
    m=re.match(r'^(\s*)(.*?)(\s*)$',body,re.S); lead,core,tail=m.groups()
    if not CYR.search(core): return raw
    call='T('+q+core+q+')'
    if not lead and not tail: return call
    parts=([q+lead+q] if lead else [])+[call]+([q+tail+q] if tail else [])
    return '('+'+'.join(parts)+')'
def wrap_segment(seg):
    m=re.match(r'^(\s*)(.*?)(\s*)$',seg,re.S); lead,core,tail=m.groups()
    if not CYR.search(core): return seg
    # шаблонный текст -> обычная строка: экранирования \` \$ \\ оставляем как есть (валидны в "..")
    core_js=core.replace('"','\\"').replace('\n','\\n')
    return lead+'${T("'+core_js+'")}'+tail
class Tpl:  # состояние разметки внутри шаблона, переживает ${...}
    def __init__(s): s.state='text'; s.q=None
def process_tpl_part(text, st):
    out=[]; buf=[]
    def flush():
        if buf: out.append(wrap_segment(''.join(buf))); buf.clear()
    i=0
    while i<len(text):
        ch=text[i]
        if st.state=='text':
            if ch=='<' and i+1<len(text) and re.match(r'[A-Za-z/!]',text[i+1]): flush(); st.state='tag'; out.append(ch)
            else: buf.append(ch)
        elif st.state=='tag':
            if ch in '"\'': st.state='attr'; st.q=ch; out.append(ch)
            elif ch=='>': st.state='text'; out.append(ch)
            else: out.append(ch)
        else: # attr value
            if ch==st.q: flush(); st.state='tag'; out.append(ch)
            else: buf.append(ch)
        i+=1
    flush(); return ''.join(out)
def transform(src):
    out=[]; i=0; n=len(src); last_sig=''; last_word=''
    stack=[]  # для шаблонов: ('tpl', Tpl) или ('brace',)
    def regex_allowed():
        return last_sig=='' or last_sig in '(,=:[!&|?{};+-*%<>~^' or last_word in KW
    while i<n:
        ch=src[i]
        if stack and stack[-1][0]=='tpl' and stack[-1][2]=='text':
            # читаем статическую часть шаблона до ` или ${
            j=i; part=[]
            while j<n:
                if src[j]=='\\': part.append(src[j:j+2]); j+=2; continue
                if src[j]=='`' or src.startswith('${',j): break
                part.append(src[j]); j+=1
            out.append(process_tpl_part(''.join(part), stack[-1][1]))
            if j>=n: break
            if src[j]=='`': out.append('`'); stack.pop(); i=j+1; last_sig='`'; last_word=''; continue
            out.append('${'); stack[-1]=('tpl',stack[-1][1],'expr',0); i=j+2; last_sig='{'; continue
        if ch=='/' and src.startswith('//',i):
            j=src.find('\n',i); j=n if j<0 else j; out.append(src[i:j]); i=j; continue
        if ch=='/' and src.startswith('/*',i):
            j=src.find('*/',i+2); j=n if j<0 else j+2; out.append(src[i:j]); i=j; continue
        if ch in '\'"':
            j=i+1
            while j<n and src[j]!=ch:
                j+=2 if src[j]=='\\' else 1
            raw=src[i:j+1]
            # ключ объекта {'Текст':...} не трогаем
            k=j+1
            while k<n and src[k] in ' \t': k+=1
            is_key=k<n and src[k]==':' and last_sig in '{,'
            prev=''.join(out)[-2:]
            out.append(raw if is_key or prev.endswith('T(') else wrap_quoted(raw,ch))
            i=j+1; last_sig='"'; last_word=''; continue
        if ch=='`':
            stack.append(('tpl',Tpl(),'text')); out.append('`'); i+=1; continue
        if ch=='/' and regex_allowed():
            j=i+1; cls=False
            while j<n:
                c=src[j]
                if c=='\\': j+=2; continue
                if c=='[': cls=True
                elif c==']': cls=False
                elif c=='/' and not cls: break
                elif c=='\n': break
                j+=1
            j+=1
            while j<n and src[j].isalpha(): j+=1
            out.append(src[i:j]); i=j; last_sig='/'; last_word=''; continue
        if stack and stack[-1][0]=='tpl' and stack[-1][2]=='expr':
            d=stack[-1][3]
            if ch=='{': stack[-1]=('tpl',stack[-1][1],'expr',d+1)
            elif ch=='}':
                if d==0: out.append('}'); stack[-1]=('tpl',stack[-1][1],'text'); i+=1; last_sig='}'; continue
                stack[-1]=('tpl',stack[-1][1],'expr',d-1)
        if ch.isalnum() or ch in '_$':
            j=i
            while j<n and (src[j].isalnum() or src[j] in '_$'): j+=1
            last_word=src[i:j]; last_sig='a'; out.append(src[i:j]); i=j; continue
        if not ch.isspace(): last_sig=ch; last_word=''
        out.append(ch); i+=1
    return ''.join(out)
if __name__=='__main__':
    for p in sys.argv[1:]:
        s=open(p,encoding='utf-8').read(); t=transform(s)
        if t!=s: open(p,'w',encoding='utf-8').write(t)
