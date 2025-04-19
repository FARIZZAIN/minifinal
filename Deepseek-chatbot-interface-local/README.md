# DeepSeek Chatbot Interface

A web-based chatbot interface that interacts with the **DeepSeek model** from **Ollama**. The backend is built with **Flask**, and the frontend uses **HTML**, **CSS**, and **JavaScript**. The Flask server processes user input and returns responses (including emojis), which are displayed in an interactive chat interface.

## Features

- Real-time chat interface with a chatbot.
- Integration with **Ollama's DeepSeek model** for generating responses.
- Proper handling of emojis and special characters.
- Flask backend with **CORS** support for cross-origin requests.

## Prerequisites

1. **Ollama**: You need to install the **Ollama** tool, which is required to run the DeepSeek model.
2. **Python 3.x**: Ensure you have Python installed for running the Flask server.

---

### Installation and Setup

Follow these steps to set up and run the project on your local machine.

---

### Step 1: Install **Ollama**

1. **Download Ollama** from the official website:  
   [Ollama Download](https://ollama.com/)
   
   Ollama is available for **Windows**, **macOS**, and **Linux**.


2. **Verify Ollama Installation**:
   - Open a terminal or command prompt and run:
     ```bash
     ollama --version
     ```
   - If the command returns the version number of **Ollama**, it is successfully installed.

3. **Then Install DeepSeek Model**:
   - Open a terminal or command prompt and run:
        ```bash
     ollama run deepseek-r1:8b
     ```
    -- It will download a 4.9gb model automatically on your PC


---

### Step 2: Clone the Repository

1. **Clone the project repository** to your local machine:
   ```bash
   git clone https://github.com/your-username/ollama-chatbot-interface.git
   cd ollama-chatbot-interface

### Step 3: Install Python and Required Dependencies

1. **Install Python** (if you don't already have it):
   - Download and install **Python 3.x** from [Python's official website](https://www.python.org/downloads/).
   - After installation, verify Python and `pip` (Python's package manager):
     ```bash
     python --version
     pip --version
     ```

2. **Install required Python libraries** for the backend:
   - In your terminal, navigate to the project directory (`ollama-chatbot-interface`) and run:
     ```bash
     pip install Flask flask-cors
     ```

---

### Step 4: Set Up the Backend Server (`server.py`)

1. **Create the backend script**: In the project folder, create a Python file named `server.py`.

2. **Configure the backend** to process user input, run the **Ollama** model, and return a response.

---

### Step 5: Run the Backend Server

1. **Start the Flask server**:
   - In your terminal, navigate to the project directory where `server.py` is located and run:
     ```bash
     python server.py
     ```
   - The backend server will start on `http://127.0.0.1:5000`. Ensure that the server is running and listening for incoming requests.

---

### Step 6: Set Up the Frontend

1. **Create the HTML, CSS, and JavaScript files** in the project directory. Ensure that you have the appropriate file structure for your frontend.

2. **Edit the HTML** to create the basic structure of the chat interface.

3. **Style the interface** with CSS, creating a simple, clean, and responsive layout.

4. **Write JavaScript** to handle user interactions, send requests to the Flask backend, and update the chat window with the responses from the model.

---

### Step 7: Interact with the Chatbot

1. **Open the `index.html` file** in your web browser to view the chatbot interface.

2. **Enter a message** in the chat input field and click the "Send" button.

3. **The backend** will process your message using **Ollama's DeepSeek model** and return a response, including emojis.

4. **The response** will be displayed in the chat interface.

---

### Troubleshooting

1. **CORS Issues**: If you're running the frontend from a different domain, ensure that the Flask server is properly configured to allow cross-origin requests. This is already handled by Flask-CORS in the backend (`server.py`).

2. **Ollama Model Not Responding**: If the Ollama model is not running or returns an error, check that Ollama is properly installed and the `ollama run deepseek-r1:8b` command is valid.

3. **500 Internal Server Error**: Check the error messages in the terminal running the Flask server. It might be related to the input passed to the `ollama` command or issues with the Python subprocess.

---



### Acknowledgments

- **Ollama**: For providing the powerful DeepSeek model.
- **Flask**: For making it easy to build the backend server.
- **HTML/CSS/JavaScript**: For creating the frontend chat interface.

---

### Contact

For issues or questions, please open an issue or contact me directly through [GitHub](https://github.com/Rishiraj8).
