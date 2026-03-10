import os
from ollama import Client


client = Client(
    host="https://ollama.com",
    headers={'Authorization': 'Bearer ' + '3c6f824ed886478283aeba63f304f263.N-AYUv78Xzy3-EqfBK4PJ2tO'}
)

messages = [
  {
    'role': 'user',
    'content': 'What do you do the best compared with other models? Limit your answer to 100 words.',
  },
]

for part in client.chat('qwen3.5:397b-cloud', messages=messages, stream=True):
  print(part['message']['content'], end='', flush=True)