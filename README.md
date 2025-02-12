# OshoGPT 🧘‍♂️

OshoGPT is an AI-powered chat application that simulates conversations in the style of Osho, offering spiritual wisdom and insights through a modern web interface.

## Features ✨

- Real-time streaming responses in Osho's distinctive style
- Beautiful, responsive UI with smooth animations
- Toggleable "Thinking" mode to see the AI's thought process
- Persistent user preferences
- Mobile-friendly design
- Elegant message threading with avatars
- Auto-resizing input field
- Typing indicators and smooth scrolling

## Prerequisites 🛠️

- Python 3.7+
- Flask
- Ollama (local LLM server)
- Modern web browser
- Internet connection (for fonts and icons)

## Installation 🚀

1. Clone the repository:
```bash
git clone <repository-url>
cd oshogpt
```

2. Install Python dependencies:
```bash
pip install flask requests
```

3. Install and start Ollama:
- Follow instructions at [Ollama's official website](https://ollama.ai)
- Make sure the Ollama server is running on `http://localhost:11434`

## Project Structure 📁

```
oshogpt/
├── main.py              # Flask server and API endpoints
├── static/
│   ├── css/
│   │   └── styles.css   # Styling and animations
│   ├── images/
│   │   ├── dazai.jpg    # User avatar
│   │   └── osho.jpeg    # Osho avatar
│   └── js/
│       └── script.js    # Client-side logic
├── templates/
│   └── index.html       # Main application template
└── README.md           # Project documentation
```

## Configuration ⚙️

The main configuration options are in `main.py`:

- `OLLAMA_API_URL`: URL of your Ollama server (default: "http://localhost:11434/api/generate")
- `MODEL`: The LLM model to use (default: "deepseek-r1")
- `OSHO_SYSTEM_PROMPT`: The system prompt that guides the AI's responses

## Usage 💡

1. Start the Ollama server
2. Run the Flask application:
```bash
python main.py
```
3. Open your browser and navigate to `http://localhost:5000`
4. Start your spiritual conversation with OshoGPT!

## Features in Detail 🔍

### Streaming Responses
- Real-time response streaming for a more engaging experience
- Typing indicators while waiting for responses
- Smooth text animation

### Thinking Mode
- Toggle the "Thinking" button to see the AI's thought process
- Persistent preference saving across sessions
- Elegant animations for showing/hiding thinking sections

### UI/UX
- Gradient backgrounds and smooth transitions
- Responsive design that works on all devices
- Auto-expanding input field
- Message threading with distinct user and Osho avatars
- Smooth scrolling and animations

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

[Your chosen license]

## Acknowledgments 🙏

- Inspired by Osho's teachings and wisdom
- Built with Flask and modern web technologies
- Uses Ollama for local LLM inference