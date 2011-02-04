OUTPUT=index.html slides.html slides.tex slides.pdf
TEXJUNK=slides.aux slides.out slides.log
TEXPATH=/usr/local/teTex/bin/`/usr/local/teTex/bin/highesttexbin.pl`

all: $(OUTPUT)

clean:
	rm -f $(OUTPUT) $(TEXJUNK)

index.html: slides.html
	cp $< $@

slides.html: slides.txt includes/*.html
	rst2s5.py --theme-url ui/mochikit slides.txt $@

slides.tex: slides.txt includes/*.tex
	rst2latex.py --graphicx-option=pdftex \
		--stylesheet-path=includes/style.tex \
		slides.txt $@

slides.pdf: slides.tex
	$(TEXPATH)/pdflatex slides.tex

.PHONY: all clean
