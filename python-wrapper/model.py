import json
import sys

data = json.load(sys.stdin)
sys.stderr.write(f'Received data: {repr(data)}')
print(r'{"p": [30, 48, 9, 8]}')
