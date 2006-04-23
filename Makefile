OUTPUT=slides.html

all: $(OUTPUT)

clean:
	rm -f $(OUTPUT)

slides.html: slides.txt
	rst2s5.py slides.txt $@

.PHONY: all clean
