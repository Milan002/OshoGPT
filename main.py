import os
import json
import requests
import re
from flask import Flask, request, jsonify, render_template, send_from_directory, Response, stream_with_context

app = Flask(__name__, static_folder='static', template_folder='templates')

# Configuration for Ollama API
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL = "deepseek-r1"

# The Osho-style prompt template
OSHO_SYSTEM_PROMPT = """
You are OshoGPT, You just have to act like osho and give answer as osho gives .
"""

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Process chat requests and return Osho-style responses"""
    try:
        data = request.json
        user_prompt = data.get('prompt', '')
        
        if not user_prompt:
            return jsonify({"error": "Empty prompt"}), 400

        # Prepare the prompt for Ollama with Osho style
        full_prompt = f"{OSHO_SYSTEM_PROMPT}\n\nQuestion: {user_prompt}\n\nOshoGPT:"
        
        def generate():
            # Request to Ollama API with streaming enabled
            response = requests.post(
                OLLAMA_API_URL,
                json={
                    "model": MODEL,
                    "prompt": full_prompt,
                    "stream": True
                },
                stream=True
            )
            
            if response.status_code != 200:
                yield json.dumps({"error": f"Ollama API error: {response.text}"})
                return
            
            # Variables to track and process thinking sections
            buffer = ""
            in_thinking = False
            
            # Stream the response chunks
            for line in response.iter_lines():
                if line:
                    chunk = json.loads(line)
                    if 'response' in chunk:
                        text_chunk = chunk['response']
                        buffer += text_chunk
                        
                        # Process the buffer to handle thinking tags incrementally
                        while True:
                            if not in_thinking:
                                # Look for opening thinking tag
                                start_idx = buffer.find("<think>")
                                if start_idx >= 0:
                                    # Output text before the tag
                                    if start_idx > 0:
                                        yield json.dumps({"chunk": buffer[:start_idx]}) + "\n"
                                    
                                    # Move to thinking mode
                                    buffer = buffer[start_idx + 7:]  # Skip past <think>
                                    in_thinking = True
                                else:
                                    # No opening tag found, output if there's content
                                    if buffer:
                                        yield json.dumps({"chunk": buffer}) + "\n"
                                        buffer = ""
                                    break
                            else:
                                # In thinking mode, look for closing tag
                                end_idx = buffer.find("</think>")
                                if end_idx >= 0:
                                    # Output thinking content immediately
                                    if end_idx > 0:
                                        yield json.dumps({"thinking": buffer[:end_idx]}) + "\n"
                                    
                                    # Reset and continue normal output
                                    buffer = buffer[end_idx + 8:]  # Skip past </think>
                                    in_thinking = False
                                else:
                                    # Output available thinking content immediately
                                    if buffer:
                                        yield json.dumps({"thinking": buffer}) + "\n"
                                        buffer = ""
                                    break
                                
                    if chunk.get('done', False):
                        # Process any remaining buffer
                        if buffer:
                            if in_thinking:
                                yield json.dumps({"thinking": buffer}) + "\n"
                            else:
                                yield json.dumps({"chunk": buffer}) + "\n"
                        break
        
        return Response(stream_with_context(generate()), content_type='application/json')
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ensure necessary directories exist
def ensure_directories():
    """Create necessary directories if they don't exist"""
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)

if __name__ == "__main__":
    ensure_directories()
    app.run(debug=True)