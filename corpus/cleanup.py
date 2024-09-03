# cleanup the text corpus; remove backslashes, or any characters that do not appear in text documents

import re

def cleanup():
    f = open("corpus_raw.txt", "r")
    text = f.read()
    f.close()

    text = text.replace("\\", "") # remove backslashes
    text = re.sub(r'[^a-zA-Z0-9 \.\,\'\"\;\:\?\!\(\)\-\_\+\=\&\$\@\#\%\*\[\]\{\}\<\>\~\^\`\|\/\n]', '', text) # remove any characters that do not appear in text documents
    text = text.replace("\n", ". ").replace(". . ", ". ") # replace newlines with periods

    f = open("corpus_clean.txt", "w")
    f.write(text)
    f.close()


if __name__ == "__main__":
    cleanup()
