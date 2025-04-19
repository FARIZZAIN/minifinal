from flask import Flask, request, jsonify
import subprocess
from flask_cors import CORS
import logging
import random

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
            text=True
        )
        
        # Prepare the input with custom instructions
        formatted_prompt = f"Answer concisely and directly. Do not show your reasoning or thought process.\n\n{user_message}"

        # Send to DeepSeek
        stdout, stderr = process.communicate(formatted_prompt)

        if process.returncode != 0:
            app.logger.error(f"Error running command: {stderr}")
            return jsonify({"error": stderr}), 500

        response_message = stdout.strip()
        

        process_mcq = subprocess.Popen(
            ["ollama", "run", "deepseek-coder:6.7b"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
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

        Example format:
        Q: What is the capital of France?
        A: Berlin
        B: Madrid
        C: Paris
        D: London
        CORRECT: C
        HINT: It's known as the "City of Light"
        """
        mcq_stdout, mcq_stderr = process_mcq.communicate(mcq_prompt)
        
        if process_mcq.returncode != 0:
            app.logger.error(f"Error generating MCQs: {mcq_stderr}")
            mcq_questions = []
        else:
            # Parse the MCQ questions
            mcq_raw = mcq_stdout.strip()
            mcq_questions = parse_mcq_questions(mcq_raw)

        # Ensure the output response is sent as UTF-8 encoded JSON
        response = jsonify({
            "response": response_message,
            "mcq_questions": mcq_questions
        })  
        response.headers['Content-Type'] = 'application/json; charset=utf-8'  # Ensure UTF-8 content
        return response
    
    except Exception as e:
        app.logger.error(f"Error processing message: {e}")
        return jsonify({"error": str(e)}), 500
# Add this function to server.py

def generate_fallback_mcq(response_message):
    """Generate a generic MCQ if parsing fails"""
    try:
        # Extract key topics from the response (simplified approach)
        words = response_message.split()
        # Find some nouns or important words (simplified)
        important_words = [word for word in words if len(word) > 5 and word.lower() not in 
                          ['should', 'would', 'could', 'about', 'there', 'their', 'which', 'these']]
        
        if len(important_words) >= 2:
            topic1 = important_words[0]
            topic2 = important_words[min(len(important_words)-1, 10)]  # Get another word, not too far
            
            # Create a simple question
            question = {
                'question': f"Based on the information provided, which statement is most accurate?",
                'options': {
                    'A': f"The information primarily discusses {topic1}.",
                    'B': f"The information focuses on the relationship between {topic1} and {topic2}.",
                    'C': f"The information doesn't mention {topic1}.",
                    'D': f"The information contradicts facts about {topic1}."
                },
                'correct': 'B',
                'hint': "Review the main topics covered in the information."
            }
            
            return [question]
        else:
            # Super generic fallback
            return [{
                'question': "Which of the following best represents the main point of the information?",
                'options': {
                    'A': "It provides factual information about a specific topic.",
                    'B': "It gives instructions on how to perform an action.",
                    'C': "It explains a concept or theory.",
                    'D': "It compares different viewpoints or approaches."
                },
                'correct': 'A',  # Default - adjust based on your most common response types
                'hint': "Consider what category the information falls into."
            }]
    except Exception as e:
        app.logger.error(f"Error generating fallback MCQ: {e}")
        return []
def parse_mcq_questions(raw_text):
    """Parse raw text into structured MCQ questions with improved robustness."""
    questions = []
    current_question = None
    
    # Handle both newline separated text and potential paragraph breaks
    lines = raw_text.replace('\r\n', '\n').split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:  # Skip empty lines
            continue
            
        # Question detection - more flexible matching
        if line.startswith('Q:') or line.startswith('Question:') or line.lower().startswith('question '):
            # Start a new question
            if current_question and 'question' in current_question and current_question['options']:
                questions.append(current_question)
                
            current_question = {'options': {}}
            question_text = line.split(':', 1)[1].strip() if ':' in line else line
            current_question['question'] = question_text
            
        # Option detection
        elif current_question and (
            line.startswith('A:') or line.startswith('B:') or 
            line.startswith('C:') or line.startswith('D:')
        ):
            option_letter = line[0]
            option_text = line[2:].strip() if len(line) > 2 else ""
            current_question['options'][option_letter] = option_text
            
        # Alternative option format detection (A) or A. format
        elif current_question and (
            line.startswith('(A)') or line.startswith('(B)') or
            line.startswith('(C)') or line.startswith('(D)') or
            line.startswith('A.') or line.startswith('B.') or
            line.startswith('C.') or line.startswith('D.')
        ):
            option_letter = line[1] if line.startswith('(') else line[0]
            option_text = line[3:].strip() if line.startswith('(') else line[2:].strip()
            current_question['options'][option_letter] = option_text
            
        # Correct answer detection - more flexible matching
        elif current_question and (
            line.startswith('CORRECT:') or line.startswith('Correct:') or
            line.startswith('ANSWER:') or line.startswith('Answer:') or
            line.lower().startswith('correct answer') or line.lower().startswith('the answer is')
        ):
            # Extract just the letter from various formats
            answer_text = line.split(':', 1)[1].strip() if ':' in line else line
            # Look for a letter A, B, C, or D in the answer
            for letter in ['A', 'B', 'C', 'D']:
                if letter in answer_text:
                    current_question['correct'] = letter
                    break
            # If no letter found, use the first character if it's a valid option
            if 'correct' not in current_question and answer_text:
                first_char = answer_text[0].upper()
                if first_char in ['A', 'B', 'C', 'D']:
                    current_question['correct'] = first_char
                    
        # Hint detection - more flexible matching
        elif current_question and (
            line.startswith('HINT:') or line.startswith('Hint:') or
            line.lower().startswith('hint ') or line.lower().startswith('if wrong')
        ):
            hint_text = line.split(':', 1)[1].strip() if ':' in line else line
            current_question['hint'] = hint_text
    
    # Add the last question if it exists and has options
    if current_question and 'question' in current_question and current_question['options']:
        # If we somehow missed setting a correct answer, default to option A
        if 'correct' not in current_question:
            app.logger.warning(f"No correct answer found for question: {current_question['question']}")
            current_question['correct'] = 'A'
        
        # If we somehow missed setting a hint, create a default one
        if 'hint' not in current_question:
            current_question['hint'] = "Try again! Review the information provided."
            
        questions.append(current_question)
        
    # Handle case where we have no valid questions
    if not questions:
        app.logger.warning("No valid MCQ questions could be parsed from the response.")
        
    return questions

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')  # Allow external access if needed