import json
import tiktoken
import sys

enc = tiktoken.get_encoding("o200k_base")
assert enc.decode(enc.encode("hello world")) == "hello world"

# To get the tokeniser corresponding to a specific model in the OpenAI API:
enc = tiktoken.encoding_for_model("gpt-4o")

amount_of_tokens = ''

if __name__ == "__main__":
    if len(sys.argv) > 1:
        amount_of_tokens = enc.encode(sys.argv[1])
        print(f'Encoded tokens: {amount_of_tokens}')
        json.dumps({'tokens': amount_of_tokens})
    else:
        print("Please provide a string to encode as a command line argument.")