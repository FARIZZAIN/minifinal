const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("sendButton");
const skillDomainsContainer = document.getElementById("skill-domains");
const overallProgressBar = document.getElementById("overall-progress-bar");
const overallProgressText = document.getElementById("overall-progress-text");

// BKT parameters - these can be adjusted based on your needs
const BKT_PARAMS = {
  prior: 0.3,       // P(L₀) - Prior probability of mastery
  learn: 0.1,       // P(T) - Learning rate
  guess: 0.2,       // P(G) - Guess probability
  slip: 0.1         // P(S) - Slip probability
};

// Knowledge tracking data
const knowledgeData = {
  domains: {},       // Store knowledge level for different domains
  overallMastery: 0, // Overall mastery across all domains
  totalQuestions: 0,
  answeredCorrectly: 0
};

// Extract topic from question or response
function extractTopicFromText(text) {
  // Simple extraction - take first main keyword from text
  // This is a simplified approach - a more sophisticated NLP approach would be better in production
  const commonWords = ["how", "what", "why", "is", "are", "the", "a", "an", "in", "on", "of", "to", "for"];
  
  // Get first few words of text and find a suitable topic
  const words = text.split(/\s+/).slice(0, 10);
  
  for (const word of words) {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (cleanWord.length > 3 && !commonWords.includes(cleanWord)) {
      return cleanWord;
    }
  }
  
  return "general"; // Default topic if no suitable word found
}

// Update the knowledge sidebar with current mastery data
function updateKnowledgeSidebar() {
  // Update overall progress
  const overallPercentage = knowledgeData.totalQuestions > 0 
    ? Math.round((knowledgeData.answeredCorrectly / knowledgeData.totalQuestions) * 100) 
    : 0;
  
  overallProgressBar.style.width = `${overallPercentage}%`;
  overallProgressText.textContent = `${overallPercentage}%`;
  
  // Clear and rebuild domain items
  skillDomainsContainer.innerHTML = '';
  
  // Sort domains by mastery level in descending order
  const sortedDomains = Object.entries(knowledgeData.domains)
    .sort((a, b) => b[1].mastery - a[1].mastery);
  
  for (const [domain, data] of sortedDomains) {
    const masteryPercentage = Math.round(data.mastery * 100);
    let levelClass = 'level-low';
    let levelText = 'Beginner';
    
    if (masteryPercentage >= 80) {
      levelClass = 'level-high';
      levelText = 'Advanced';
    } else if (masteryPercentage >= 50) {
      levelClass = 'level-medium';
      levelText = 'Intermediate';
    }
    
    const domainElement = document.createElement('div');
    domainElement.className = 'skill-item';
    domainElement.innerHTML = `
      <div class="skill-header">
        <span class="skill-name">${domain.charAt(0).toUpperCase() + domain.slice(1)}</span>
        <span class="skill-level ${levelClass}">${levelText}</span>
      </div>
      <div class="skill-bar-container">
        <div class="skill-bar" style="width: ${masteryPercentage}%; background-color: var(--${levelClass.split('-')[1]}-color);"></div>
      </div>
      <div class="skill-stats">
        <span>Mastery: ${masteryPercentage}%</span>
        <span>Questions: ${data.attempts}</span>
      </div>
    `;
    
    skillDomainsContainer.appendChild(domainElement);
  }
}

// Initialize a domain if it doesn't exist
function initializeDomain(domain) {
  if (!knowledgeData.domains[domain]) {
    knowledgeData.domains[domain] = {
      mastery: BKT_PARAMS.prior, // Initialize with prior probability
      attempts: 0,
      correct: 0
    };
  }
}

// Update mastery using BKT model after a student's response
function updateMastery(domain, isCorrect) {
  initializeDomain(domain);
  const domainData = knowledgeData.domains[domain];
  domainData.attempts++;
  
  if (isCorrect) {
    domainData.correct++;
  }
  
  // Get current mastery probability
  let mastery = domainData.mastery;
  
  // Step 1: Update based on evidence (correct/incorrect response)
  if (isCorrect) {
    // P(L|C) - Probability of knowing skill given correct response
    mastery = (mastery * (1 - BKT_PARAMS.slip)) / 
              (mastery * (1 - BKT_PARAMS.slip) + (1 - mastery) * BKT_PARAMS.guess);
  } else {
    // P(L|I) - Probability of knowing skill given incorrect response
    mastery = (mastery * BKT_PARAMS.slip) / 
              (mastery * BKT_PARAMS.slip + (1 - mastery) * (1 - BKT_PARAMS.guess));
  }
  
  // Step 2: Update based on learning opportunity
  mastery = mastery + (1 - mastery) * BKT_PARAMS.learn;
  
  // Update domain mastery
  domainData.mastery = mastery;
  
  // Update overall stats
  knowledgeData.totalQuestions++;
  if (isCorrect) {
    knowledgeData.answeredCorrectly++;
  }
  
  // Recalculate overall mastery as average of all domains
  const domains = Object.values(knowledgeData.domains);
  knowledgeData.overallMastery = domains.reduce((sum, domain) => sum + domain.mastery, 0) / domains.length;
  
  // Update sidebar
  updateKnowledgeSidebar();
  
  return {
    mastery: mastery,
    level: getMasteryLevel(mastery)
  };
}

// Get mastery level text based on probability
function getMasteryLevel(mastery) {
  const masteryPercentage = mastery * 100;
  if (masteryPercentage >= 80) {
    return "Advanced";
  } else if (masteryPercentage >= 50) {
    return "Intermediate";
  } else {
    return "Beginner";
  }
}

function addMessage(message, isUser) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(isUser ? "user-message" : "bot-message");
  chatBox.appendChild(messageElement);

  if (isUser) {
    messageElement.textContent = message;
    scrollToBottom();
  } else {
    formatBotMessage(messageElement, message);
  }
}

function formatBotMessage(element, text) {
  // Process code blocks first (surrounded by triple backticks)
  let formattedText = text;
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const codeSegments = [];
  let match;
  let lastIndex = 0;
  let processedText = '';
  
  // Extract code blocks and replace with placeholders
  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    processedText += text.substring(lastIndex, match.index);
    
    // Create placeholder for code block
    const placeholder = `__CODE_BLOCK_${codeSegments.length}__`;
    codeSegments.push(match[1].trim());
    processedText += placeholder;
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last code block
  processedText += text.substring(lastIndex);
  
  // Process inline code (single backticks)
  const inlineCodeRegex = /`([^`]+)`/g;
  let inlineMatch;
  lastIndex = 0;
  let finalText = '';
  
  while ((inlineMatch = inlineCodeRegex.exec(processedText)) !== null) {
    finalText += processedText.substring(lastIndex, inlineMatch.index);
    
    // Create inline code element
    finalText += `<code>${inlineMatch[1]}</code>`;
    
    lastIndex = inlineMatch.index + inlineMatch[0].length;
  }
  
  // Add remaining text
  finalText += processedText.substring(lastIndex);
  
  // Replace code block placeholders with actual pre elements
  codeSegments.forEach((code, index) => {
    const placeholder = `__CODE_BLOCK_${index}__`;
    finalText = finalText.replace(placeholder, `<pre>${code}</pre>`);
  });
  
  // Set the HTML content
  element.innerHTML = finalText;
  
  // Start the typewriter effect
  typewriterEffect(element, element.innerHTML);
}

function typewriterEffect(element, html, speed = 10) {
  // Store original content
  const originalHTML = html;
  
  // Clear the element
  element.innerHTML = "";
  
  // Process the HTML character by character
  let currentHTML = "";
  let i = 0;
  let inTag = false;
  let currentTag = "";
  
  const timer = setInterval(() => {
    if (i < originalHTML.length) {
      const char = originalHTML.charAt(i);
      
      if (char === '<') {
        inTag = true;
        currentTag += char;
      } else if (char === '>' && inTag) {
        inTag = false;
        currentTag += char;
        currentHTML += currentTag;
        currentTag = "";
      } else if (inTag) {
        currentTag += char;
      } else {
        currentHTML += char;
      }
      
      element.innerHTML = currentHTML;
      
      if (!inTag) {
        scrollToBottom();
      }
      
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addQuizQuestion(question) {
  const questionContainer = document.createElement("div");
  questionContainer.classList.add("quiz-container");
  
  const questionText = document.createElement("div");
  questionText.classList.add("quiz-question");
  questionText.textContent = question.question;
  questionContainer.appendChild(questionText);
  
  // Create option buttons
  const optionsContainer = document.createElement("div");
  optionsContainer.classList.add("quiz-options");
  
  // Generate unique question ID
  const questionId = `question-${Math.random().toString(36).substring(7)}`;
  questionContainer.id = questionId;
  
  // Extract topic from question text
  const topic = extractTopicFromText(question.question);
  initializeDomain(topic);
  
  for (const [key, value] of Object.entries(question.options)) {
    const optionButton = document.createElement("button");
    optionButton.classList.add("quiz-option");
    optionButton.textContent = `${key}: ${value}`;
    optionButton.dataset.option = key;
    
    optionButton.addEventListener("click", function() {
      // Prevent multiple answers to the same question
      if (this.closest('.quiz-container').querySelector('.quiz-feedback')) {
        return;
      }
      
      // Check if answer is correct
      const isCorrect = key === question.correct;
      
      // Update BKT model
      const masteryResult = updateMastery(topic, isCorrect);
      
      // Show feedback
      const feedback = document.createElement("div");
      feedback.classList.add("quiz-feedback");
      
      if (isCorrect) {
        feedback.textContent = "Correct! Well done! 🎉";
        feedback.classList.add("correct");
      } else {
        feedback.textContent = `Incorrect. ${question.hint}`;
        feedback.classList.add("incorrect");
      }
      
      questionContainer.appendChild(feedback);
      
      // Add skill level indicator
      const skillLevelContainer = document.createElement("div");
      skillLevelContainer.classList.add("skill-level-container");
      
      const levelClass = masteryResult.level.toLowerCase();
      skillLevelContainer.innerHTML = `
        <div class="skill-level-label level-${levelClass}">
          ${topic.charAt(0).toUpperCase() + topic.slice(1)} Knowledge: ${masteryResult.level}
        </div>
      `;
      
      questionContainer.appendChild(skillLevelContainer);
      
      scrollToBottom();
    });
    
    optionsContainer.appendChild(optionButton);
  }
  
  questionContainer.appendChild(optionsContainer);
  chatBox.appendChild(questionContainer);
  scrollToBottom();
}

async function sendMessage() {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, true);
  chatInput.value = "";
  
  // Extract topic from user message and initialize in knowledge model
  const topic = extractTopicFromText(userMessage);
  initializeDomain(topic);

  try {
    const response = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    if (response.ok) {
      addMessage(data.response.trim(), false);
      
      // Add MCQ questions after a short delay
      if (data.mcq_questions && data.mcq_questions.length > 0) {
        setTimeout(() => {
          addMessage("Let's test your understanding with a few questions:", false);
          
          // Add each question one by one with delays
          data.mcq_questions.forEach((question, index) => {
            setTimeout(() => {
              addQuizQuestion(question);
            }, index * 1000); // 1-second delay between questions
          });
        }, 1000); // 1-second delay after the main response
      }
    } else {
      addMessage(`Error: ${data.error}`, false);
    }
  } catch (error) {
    addMessage("Error: Unable to connect to server.", false);
  }
}

// Initialize the application
function init() {
  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Initialize sidebar
  updateKnowledgeSidebar();
  
  // Add a welcome message
  setTimeout(() => {
    addMessage("Welcome to the DeepSeek Chat with BKT! I can help you learn about programming concepts, test your knowledge, and track your mastery level across different topics. Ask me anything!", false);
  }, 500);
}

// Start the application when the page loads
window.addEventListener("load", init);