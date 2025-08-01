import json
import tiktoken
import sys

def get_tokens(messages, role):
    enc = tiktoken.encoding_for_model("gpt-4o-mini")
    tokens = 0
    for message in messages:
        if message["role"] == role:
            tokens += len(enc.encode(message["content"]))
    return tokens

if __name__ == "__main__":
    try:
        input_data = json.load(sys.stdin)
        messages = input_data.get("messages", [])
        role = input_data.get("role", "user")
        total_tokens = get_tokens(messages, role)
        print(json.dumps({"tokens": total_tokens}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
