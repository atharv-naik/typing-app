# cleanup the text corpus; remove backslashes, or any characters that do not appear in text documents

import os
import re
import sys
import string

def cleanup():
    # read the file
    f = open("corpus.txt", "r")
    text = f.read()
    f.close()

    # remove backslashes
    text = text.replace("\\", "")

    # keep only alphanumeric characters, spaces, and periods and special characters that appear in text documents
    text = re.sub(r'[^a-zA-Z0-9 \.\,\'\"\;\:\?\!\(\)\-\_\+\=\&\$\@\#\%\*\[\]\{\}\<\>\~\^\`\|\/\n]', '', text)
    text = text.replace("\n", ". ").replace(". . ", ". ")

    # write the cleaned text to a new file
    f = open("corpus_cleaned2.txt", "w")
    f.write(text)
    f.close()

if __name__ == "__main__":
    cleanup()