from flask import Flask, request, jsonify
import subprocess
from flask_cors import CORS
import logging
import random
import re

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    app.logger.debug(f"Received message: {user_message}")

    try:
        process = subprocess.Popen(
            ["ollama", "run", "deepseek-coder:6.7b"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        
        # Prepare the input with clear instructions for code formatting
        formatted_prompt = f"""
        Answer the following question clearly and concisely. When explaining programming concepts:
        1. Always wrap code examples in triple backticks (```) with the language specified
        2. Use proper indentation in code blocks
        3. Keep explanations simple and to the point
        4. Format the response for good readability in a chat interface

        User question: {user_message}
        """

        # Send to DeepSeek
        stdout, stderr = process.communicate(formatted_prompt)

        if process.returncode != 0:
            app.logger.error(f"Error running command: {stderr}")
            return jsonify({"error": stderr}), 500

        response_message = stdout.strip()
        
        # Ensure proper code block formatting
        response_message = ensure_proper_code_blocks(response_message)

        process_mcq = subprocess.Popen(
            ["ollama", "run", "deepseek-coder:6.7b"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace'
        )

        mcq_prompt = f"""
        Based on this information: "{response_message}"

        Create exactly 2 multiple-choice questions to test understanding of the key concepts.
        Follow this EXACT format for each question:

        Q: [Write the question text here]
        A: [Write option A here]
        B: [Write option B here]
        C: [Write option C here]
        D: [Write option D here]
        CORRECT: [ONLY write the correct option letter here (A, B, C, or D)]
        HINT: [Write a hint for someone who gets it wrong]

        IMPORTANT FORMATTING RULES:
        1. Start each question with "Q:" exactly
        2. Start each option with the letter followed by a colon (e.g., "A:")
        3. Only include one correct option letter after "CORRECT:"
        4. Always include options A, B, C, and D
        5. Always include a HINT
        6. Do not include any additional text, explanations, or comments
        7. Create 2 questions total
        """
        mcq_stdout, mcq_stderr = process_mcq.communicate(mcq_prompt)
        
        if process_mcq.returncode != 0:
            app.logger.error(f"Error generating MCQs: {mcq_stderr}")
            mcq_questions = generate_fallback_mcq(response_message)
        else:
            mcq_raw = mcq_stdout.strip()
            mcq_questions = parse_mcq_questions(mcq_raw)
            if not mcq_questions:
                mcq_questions = generate_fallback_mcq(response_message)

        return jsonify({
            "response": response_message,
            "mcq_questions": mcq_questions
        })
    
    except Exception as e:
        app.logger.error(f"Error processing message: {e}")
        return jsonify({"error": str(e)}), 500

def categorize_python_domain(text):
    # Define Python domains and their related keywords
    python_domains = {
        "variables": ["variable", "assign", "declaration", "define"],
        "datatypes": ["datatype", "string", "int", "float", "boolean", "list", "dict", "tuple", "set", "type"],
        "operators": ["operator", "arithmetic", "comparison", "+", "-", "*", "/", "==", "!=", "<=", ">="],
        "conditionals": ["if", "else", "elif", "condition", "ternary", "conditional"],
        "loops": ["loop", "for", "while", "iterate", "iteration", "break", "continue"],
        "functions": ["function", "def", "return", "argument", "parameter", "lambda"],
        "classes": ["class", "object", "instance", "method", "attribute", "property", "init", "constructor", "oop"],
        "inheritance": ["inheritance", "inherit", "subclass", "superclass", "parent class", "child class", "override"],
        "exceptions": ["exception", "try", "except", "finally", "raise", "error", "handling", "catch"],
        "modules": ["module", "import", "package", "library", "from"],
        "file_io": ["file", "open", "read", "write", "close", "with", "io", "input", "output"],
        "comprehensions": ["comprehension", "list comprehension", "dict comprehension", "generator expression"],
        "generators": ["generator", "yield", "iterator", "iterable", "next"],
        "decorators": ["decorator", "@", "wrapper", "meta"],
        "regex": ["regex", "regular expression", "pattern", "match", "search", "findall", "re"],
        "advanced_concepts": ["closure", "recursion", "memoization", "algorithm", "efficiency"]
    }
    
    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()
    
    # Score each domain based on keyword matches
    domain_scores = {}
    for domain, keywords in python_domains.items():
        domain_scores[domain] = sum(1 for keyword in keywords if keyword.lower() in text_lower)
    
    # Find domain with highest score
    best_domain = max(domain_scores.items(), key=lambda x: x[1], default=("general", 0))
    
    return best_domain[0] if best_domain[1] > 0 else "general"

def ensure_proper_code_blocks(text):
    """Ensure all code blocks are properly formatted with triple backticks"""
    # Pattern to detect unformatted code blocks (indented code)
    indented_code_pattern = r'(?:\n|^)(?P<indent>[ ]{4,}|\t)(?P<code>.+?(?:\n(?P=indent).+?)*)(?=\n|$)'
    
    def format_code_block(match):
        return f"\n```python\n{match.group('code')}\n```"
    
    # First replace any indented code blocks
    text = re.sub(indented_code_pattern, format_code_block, text, flags=re.MULTILINE)
    
    # Then ensure existing code blocks have proper spacing
    text = re.sub(r'```(\w*)', r'\n```\1', text)
    text = re.sub(r'```', r'```\n', text)
    
    return text.strip()

def generate_fallback_mcq(response_message):
    """Generate fallback MCQs if parsing fails"""
    try:
        # Extract first few sentences as question basis
        sentences = re.split(r'(?<=[.!?])\s+', response_message)
        topic = sentences[0] if sentences else "the concept"
        
        return [{
            'question': f"What is the main point about {topic.split()[0]} in this explanation?",
            'options': {
                'A': "It explains the basic syntax",
                'B': "It describes advanced usage",
                'C': "It compares different approaches",
                'D': "It provides optimization tips"
            },
            'correct': 'A',
            'hint': "Look for the most fundamental explanation"
        }]
    except Exception as e:
        app.logger.error(f"Error in fallback MCQ: {e}")
        return []

def parse_mcq_questions(raw_text):
    """Parse raw text into structured MCQ questions"""
    questions = []
    current_question = None
    lines = raw_text.replace('\r\n', '\n').split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith(('Q:', 'Question:')):
            if current_question and current_question.get('options'):
                # Add topic based on proper categorization
                if 'topic' not in current_question:
                    current_question['topic'] = categorize_python_domain(current_question['question'])
                questions.append(current_question)
            
            current_question = {'options': {}}
            question_text = line.split(':', 1)[1].strip()
            current_question['question'] = question_text
            # Set the topic based on the question content
            current_question['topic'] = categorize_python_domain(question_text)
            
        elif line.startswith(('A:', 'B:', 'C:', 'D:')):
            option = line[0]
            current_question['options'][option] = line[2:].strip()
            
        elif line.startswith('CORRECT:'):
            current_question['correct'] = line.split(':')[1].strip()[0].upper()
            
        elif line.startswith('HINT:'):
            current_question['hint'] = line.split(':', 1)[1].strip()
    
    if current_question and current_question.get('options'):
        if 'correct' not in current_question:
            current_question['correct'] = 'A'
        if 'hint' not in current_question:
            current_question['hint'] = "Review the main concepts"
        if 'topic' not in current_question:
            current_question['topic'] = categorize_python_domain(current_question['question'])
        questions.append(current_question)
    
    return questions[:2]  # Return max 2 questions
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')