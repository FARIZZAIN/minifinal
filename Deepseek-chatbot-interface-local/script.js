// const chatBox = document.getElementById("chat-box");
// const chatInput = document.getElementById("chat-input");
// const sendButton = document.getElementById("sendButton");
// const skillDomainsContainer = document.getElementById("skill-domains");
// const overallProgressBar = document.getElementById("overall-progress-bar");
// const overallProgressText = document.getElementById("overall-progress-text");

// // BKT parameters - these can be adjusted based on your needs
// const BKT_PARAMS = {
//   prior: 0.3,       // P(L₀) - Prior probability of mastery
//   learn: 0.1,       // P(T) - Learning rate
//   guess: 0.2,       // P(G) - Guess probability
//   slip: 0.1         // P(S) - Slip probability
// };

// // Knowledge tracking data
// const knowledgeData = {
//   domains: {},       // Store knowledge level for different domains
//   overallMastery: 0, // Overall mastery across all domains
//   totalQuestions: 0,
//   answeredCorrectly: 0
// };

// // Extract topic from question or response
// function extractTopicFromText(text) {
//   // Simple extraction - take first main keyword from text
//   // This is a simplified approach - a more sophisticated NLP approach would be better in production
//   const commonWords = ["how", "what", "why", "is", "are", "the", "a", "an", "in", "on", "of", "to", "for"];
  
//   // Get first few words of text and find a suitable topic
//   const words = text.split(/\s+/).slice(0, 10);
  
//   for (const word of words) {
//     const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
//     if (cleanWord.length > 3 && !commonWords.includes(cleanWord)) {
//       return cleanWord;
//     }
//   }
  
//   return "general"; // Default topic if no suitable word found
// }

// // Update the knowledge sidebar with current mastery data
// function updateKnowledgeSidebar() {
//   // Update overall progress
//   const overallPercentage = knowledgeData.totalQuestions > 0 
//     ? Math.round((knowledgeData.answeredCorrectly / knowledgeData.totalQuestions) * 100) 
//     : 0;
  
//   overallProgressBar.style.width = `${overallPercentage}%`;
//   overallProgressText.textContent = `${overallPercentage}%`;
  
//   // Clear and rebuild domain items
//   skillDomainsContainer.innerHTML = '';
  
//   // Sort domains by mastery level in descending order
//   const sortedDomains = Object.entries(knowledgeData.domains)
//     .sort((a, b) => b[1].mastery - a[1].mastery);
  
//   for (const [domain, data] of sortedDomains) {
//     const masteryPercentage = Math.round(data.mastery * 100);
//     let levelClass = 'level-low';
//     let levelText = 'Beginner';
    
//     if (masteryPercentage >= 80) {
//       levelClass = 'level-high';
//       levelText = 'Advanced';
//     } else if (masteryPercentage >= 50) {
//       levelClass = 'level-medium';
//       levelText = 'Intermediate';
//     }
    
//     const domainElement = document.createElement('div');
//     domainElement.className = 'skill-item';
//     domainElement.innerHTML = `
//       <div class="skill-header">
//         <span class="skill-name">${domain.charAt(0).toUpperCase() + domain.slice(1)}</span>
//         <span class="skill-level ${levelClass}">${levelText}</span>
//       </div>
//       <div class="skill-bar-container">
//         <div class="skill-bar" style="width: ${masteryPercentage}%; background-color: var(--${levelClass.split('-')[1]}-color);"></div>
//       </div>
//       <div class="skill-stats">
//         <span>Mastery: ${masteryPercentage}%</span>
//         <span>Questions: ${data.attempts}</span>
//       </div>
//     `;
    
//     skillDomainsContainer.appendChild(domainElement);
//   }
// }

// // Initialize a domain if it doesn't exist
// function initializeDomain(domain) {
//   if (!knowledgeData.domains[domain]) {
//     knowledgeData.domains[domain] = {
//       mastery: BKT_PARAMS.prior, // Initialize with prior probability
//       attempts: 0,
//       correct: 0
//     };
//   }
// }

// // Update mastery using BKT model after a student's response
// function updateMastery(domain, isCorrect) {
//   initializeDomain(domain);
//   const domainData = knowledgeData.domains[domain];
//   domainData.attempts++;
  
//   if (isCorrect) {
//     domainData.correct++;
//   }
  
//   // Get current mastery probability
//   let mastery = domainData.mastery;
  
//   // Step 1: Update based on evidence (correct/incorrect response)
//   if (isCorrect) {
//     // P(L|C) - Probability of knowing skill given correct response
//     mastery = (mastery * (1 - BKT_PARAMS.slip)) / 
//               (mastery * (1 - BKT_PARAMS.slip) + (1 - mastery) * BKT_PARAMS.guess);
//   } else {
//     // P(L|I) - Probability of knowing skill given incorrect response
//     mastery = (mastery * BKT_PARAMS.slip) / 
//               (mastery * BKT_PARAMS.slip + (1 - mastery) * (1 - BKT_PARAMS.guess));
//   }
  
//   // Step 2: Update based on learning opportunity
//   mastery = mastery + (1 - mastery) * BKT_PARAMS.learn;
  
//   // Update domain mastery
//   domainData.mastery = mastery;
  
//   // Update overall stats
//   knowledgeData.totalQuestions++;
//   if (isCorrect) {
//     knowledgeData.answeredCorrectly++;
//   }
  
//   // Recalculate overall mastery as average of all domains
//   const domains = Object.values(knowledgeData.domains);
//   knowledgeData.overallMastery = domains.reduce((sum, domain) => sum + domain.mastery, 0) / domains.length;
  
//   // Update sidebar
//   updateKnowledgeSidebar();
  
//   return {
//     mastery: mastery,
//     level: getMasteryLevel(mastery)
//   };
// }

// // Get mastery level text based on probability
// function getMasteryLevel(mastery) {
//   const masteryPercentage = mastery * 100;
//   if (masteryPercentage >= 80) {
//     return "Advanced";
//   } else if (masteryPercentage >= 50) {
//     return "Intermediate";
//   } else {
//     return "Beginner";
//   }
// }

// function addMessage(message, isUser) {
//   const messageElement = document.createElement("div");
//   messageElement.classList.add(isUser ? "user-message" : "bot-message");
//   chatBox.appendChild(messageElement);

//   if (isUser) {
//     messageElement.textContent = message;
//     scrollToBottom();
//   } else {
//     formatBotMessage(messageElement, message);
//   }
// }

// function formatBotMessage(element, text) {
//   // Process code blocks first (surrounded by triple backticks)
//   let formattedText = text;
//   const codeBlockRegex = /```([\s\S]*?)```/g;
//   const codeSegments = [];
//   let match;
//   let lastIndex = 0;
//   let processedText = '';
  
//   // Extract code blocks and replace with placeholders
//   while ((match = codeBlockRegex.exec(text)) !== null) {
//     // Add text before code block
//     processedText += text.substring(lastIndex, match.index);
    
//     // Create placeholder for code block
//     const placeholder = `__CODE_BLOCK_${codeSegments.length}__`;
//     codeSegments.push(match[1].trim());
//     processedText += placeholder;
    
//     lastIndex = match.index + match[0].length;
//   }
  
//   // Add remaining text after last code block
//   processedText += text.substring(lastIndex);
  
//   // Process inline code (single backticks)
//   const inlineCodeRegex = /`([^`]+)`/g;
//   let inlineMatch;
//   lastIndex = 0;
//   let finalText = '';
  
//   while ((inlineMatch = inlineCodeRegex.exec(processedText)) !== null) {
//     finalText += processedText.substring(lastIndex, inlineMatch.index);
    
//     // Create inline code element
//     finalText += `<code>${inlineMatch[1]}</code>`;
    
//     lastIndex = inlineMatch.index + inlineMatch[0].length;
//   }
  
//   // Add remaining text
//   finalText += processedText.substring(lastIndex);
  
//   // Replace code block placeholders with actual pre elements
//   codeSegments.forEach((code, index) => {
//     const placeholder = `__CODE_BLOCK_${index}__`;
//     finalText = finalText.replace(placeholder, `<pre>${code}</pre>`);
//   });
  
//   // Set the HTML content
//   element.innerHTML = finalText;
  
//   // Start the typewriter effect
//   typewriterEffect(element, element.innerHTML);
// }

// function typewriterEffect(element, html, speed = 10) {
//   // Store original content
//   const originalHTML = html;
  
//   // Clear the element
//   element.innerHTML = "";
  
//   // Process the HTML character by character
//   let currentHTML = "";
//   let i = 0;
//   let inTag = false;
//   let currentTag = "";
  
//   const timer = setInterval(() => {
//     if (i < originalHTML.length) {
//       const char = originalHTML.charAt(i);
      
//       if (char === '<') {
//         inTag = true;
//         currentTag += char;
//       } else if (char === '>' && inTag) {
//         inTag = false;
//         currentTag += char;
//         currentHTML += currentTag;
//         currentTag = "";
//       } else if (inTag) {
//         currentTag += char;
//       } else {
//         currentHTML += char;
//       }
      
//       element.innerHTML = currentHTML;
      
//       if (!inTag) {
//         scrollToBottom();
//       }
      
//       i++;
//     } else {
//       clearInterval(timer);
//     }
//   }, speed);
// }

// function scrollToBottom() {
//   chatBox.scrollTop = chatBox.scrollHeight;
// }

// function addQuizQuestion(question) {
//   const questionContainer = document.createElement("div");
//   questionContainer.classList.add("quiz-container");
  
//   const questionText = document.createElement("div");
//   questionText.classList.add("quiz-question");
//   questionText.textContent = question.question;
//   questionContainer.appendChild(questionText);
  
//   // Create option buttons
//   const optionsContainer = document.createElement("div");
//   optionsContainer.classList.add("quiz-options");
  
//   // Generate unique question ID
//   const questionId = `question-${Math.random().toString(36).substring(7)}`;
//   questionContainer.id = questionId;
  
//   // Extract topic from question text
//   const topic = extractTopicFromText(question.question);
//   initializeDomain(topic);
  
//   for (const [key, value] of Object.entries(question.options)) {
//     const optionButton = document.createElement("button");
//     optionButton.classList.add("quiz-option");
//     optionButton.textContent = `${key}: ${value}`;
//     optionButton.dataset.option = key;
    
//     optionButton.addEventListener("click", function() {
//       // Prevent multiple answers to the same question
//       if (this.closest('.quiz-container').querySelector('.quiz-feedback')) {
//         return;
//       }
      
//       // Check if answer is correct
//       const isCorrect = key === question.correct;
      
//       // Update BKT model
//       const masteryResult = updateMastery(topic, isCorrect);
      
//       // Show feedback
//       const feedback = document.createElement("div");
//       feedback.classList.add("quiz-feedback");
      
//       if (isCorrect) {
//         feedback.textContent = "Correct! Well done! 🎉";
//         feedback.classList.add("correct");
//       } else {
//         feedback.textContent = `Incorrect. ${question.hint}`;
//         feedback.classList.add("incorrect");
//       }
      
//       questionContainer.appendChild(feedback);
      
//       // Add skill level indicator
//       const skillLevelContainer = document.createElement("div");
//       skillLevelContainer.classList.add("skill-level-container");
      
//       const levelClass = masteryResult.level.toLowerCase();
//       skillLevelContainer.innerHTML = `
//         <div class="skill-level-label level-${levelClass}">
//           ${topic.charAt(0).toUpperCase() + topic.slice(1)} Knowledge: ${masteryResult.level}
//         </div>
//       `;
      
//       questionContainer.appendChild(skillLevelContainer);
      
//       scrollToBottom();
//     });
    
//     optionsContainer.appendChild(optionButton);
//   }
  
//   questionContainer.appendChild(optionsContainer);
//   chatBox.appendChild(questionContainer);
//   scrollToBottom();
// }

// async function sendMessage() {
//   const userMessage = chatInput.value.trim();
//   if (!userMessage) return;

//   addMessage(userMessage, true);
//   chatInput.value = "";
  
//   // Extract topic from user message and initialize in knowledge model
//   const topic = extractTopicFromText(userMessage);
//   initializeDomain(topic);

//   try {
//     const response = await fetch("http://127.0.0.1:5000/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json; charset=utf-8",
//       },
//       body: JSON.stringify({ message: userMessage }),
//     });

//     const data = await response.json();
//     if (response.ok) {
//       addMessage(data.response.trim(), false);
      
//       // Add MCQ questions after a short delay
//       if (data.mcq_questions && data.mcq_questions.length > 0) {
//         setTimeout(() => {
//           addMessage("Let's test your understanding with a few questions:", false);
          
//           // Add each question one by one with delays
//           data.mcq_questions.forEach((question, index) => {
//             setTimeout(() => {
//               addQuizQuestion(question);
//             }, index * 1000); // 1-second delay between questions
//           });
//         }, 1000); // 1-second delay after the main response
//       }
//     } else {
//       addMessage(`Error: ${data.error}`, false);
//     }
//   } catch (error) {
//     addMessage("Error: Unable to connect to server.", false);
//   }
// }

// // Initialize the application
// function init() {
//   sendButton.addEventListener("click", sendMessage);
//   chatInput.addEventListener("keypress", (e) => {
//     if (e.key === "Enter") {
//       sendMessage();
//     }
//   });

//   // Initialize sidebar
//   updateKnowledgeSidebar();
  
//   // Add a welcome message
//   setTimeout(() => {
//     addMessage("Welcome to the DeepSeek Chat with BKT! I can help you learn about programming concepts, test your knowledge, and track your mastery level across different topics. Ask me anything!", false);
//   }, 500);
// }

// // Start the application when the page loads
// window.addEventListener("load", init);


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

const PYTHON_SYLLABUS = [
  "variables", "datatypes", "operators", "conditionals", "loops", 
  "functions", "classes", "inheritance", "exceptions", "modules", 
  "file_io", "comprehensions", "generators", "decorators", "regex", 
  "advanced_concepts"
];
// Knowledge tracking data
const knowledgeData = {
  domains: {},       // Store knowledge level for different domains
  overallMastery: 0, // Overall mastery across all domains
  totalQuestions: 0,
  answeredCorrectly: 0
};

// Chat history storage
const chatHistory = {
  currentChat: [],
  pastChats: []
};

// Replace the current extractTopicFromText function with this improved version
function extractTopicFromText(text) {
  // Define major Python domains
  const pythonDomains = {
    // Core concepts
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
  };
  
  // Convert text to lowercase for case-insensitive matching
  const lowercaseText = text.toLowerCase();
  
  // Score each domain based on keyword matches
  const domainScores = {};
  
  for (const [domain, keywords] of Object.entries(pythonDomains)) {
    domainScores[domain] = 0;
    for (const keyword of keywords) {
      if (lowercaseText.includes(keyword.toLowerCase())) {
        domainScores[domain] += 1;
      }
    }
  }
  
  // Find domain with highest score
  let bestDomain = "general";
  let highestScore = 0;
  
  for (const [domain, score] of Object.entries(domainScores)) {
    if (score > highestScore) {
      highestScore = score;
      bestDomain = domain;
    }
  }
  
  return highestScore > 0 ? bestDomain : "general";
}

// Update the knowledge sidebar with current mastery data
function updateKnowledgeSidebar() {
  // Calculate progress as percentage of mastered topics out of complete syllabus
  let masteredTopics = 0;
  const masteryThreshold = 0.8; // 80% mastery is considered "Advanced"
  
  // Count how many syllabus topics have been mastered
  PYTHON_SYLLABUS.forEach(topic => {
    if (knowledgeData.domains[topic] && knowledgeData.domains[topic].mastery >= masteryThreshold) {
      masteredTopics++;
    }
  });
  
  // Overall progress now represents syllabus completion
  const overallPercentage = Math.round((masteredTopics / PYTHON_SYLLABUS.length) * 100);
  
  overallProgressBar.style.width = `${overallPercentage}%`;
  overallProgressText.textContent = `${overallPercentage}%`;
  
  // Show how many topics have been mastered
  const progressSubtext = document.createElement('div');
  progressSubtext.className = 'progress-subtext';
  progressSubtext.textContent = `${masteredTopics}/${PYTHON_SYLLABUS.length} topics mastered`;
  
  // Replace existing subtext if present, otherwise add new
  const existingSubtext = document.querySelector('.progress-subtext');
  if (existingSubtext) {
    existingSubtext.replaceWith(progressSubtext);
  } else {
    overallProgressText.parentNode.appendChild(progressSubtext);
  }
  
  // The rest of the function remains the same for displaying domain stats
  skillDomainsContainer.innerHTML = '';
  
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
      mastery: BKT_PARAMS.prior,
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
  
  let mastery = domainData.mastery;
  
  // Standard BKT update - update for both correct AND incorrect answers
  if (isCorrect) {
    // P(L|C) - Probability of knowing skill given correct response
    mastery = (mastery * (1 - BKT_PARAMS.slip)) / 
              (mastery * (1 - BKT_PARAMS.slip) + (1 - mastery) * BKT_PARAMS.guess);
  } else {
    // P(L|I) - Probability of knowing skill given incorrect response
    mastery = (mastery * BKT_PARAMS.slip) / 
              (mastery * BKT_PARAMS.slip + (1 - mastery) * (1 - BKT_PARAMS.guess));
  }
  
  // Apply learning rate
  mastery = mastery + (1 - mastery) * BKT_PARAMS.learn;
  
  // Update domain mastery
  domainData.mastery = mastery;
  knowledgeData.totalQuestions++;
  if (isCorrect) knowledgeData.answeredCorrectly++;
  
  updateKnowledgeSidebar();
  
  return {
    mastery: mastery,
    level: getMasteryLevel(mastery)
  };
}

function getMasteryLevel(mastery) {
  const masteryPercentage = mastery * 100;
  if (masteryPercentage >= 80) return "Advanced";
  if (masteryPercentage >= 50) return "Intermediate";
  return "Beginner";
}

function addMessage(message, isUser) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(isUser ? "user-message" : "bot-message");
  chatBox.appendChild(messageElement);

  // Add to chat history
  chatHistory.currentChat.push({
    text: message,
    isUser: isUser,
    timestamp: new Date().toISOString()
  });

  if (isUser) {
    messageElement.textContent = message;
    scrollToBottom();
  } else {
    formatBotMessage(messageElement, message);
  }
}

function formatBotMessage(element, text) {
  // First process code blocks with triple backticks
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
    
    // Extract language info if available (e.g., ```python or ```javascript)
    let codeContent = match[1].trim();
    let language = '';
    
    // Check if first line contains a language specification
    const firstLineMatch = codeContent.match(/^([a-zA-Z0-9_+-]+)\s*\n/);
    if (firstLineMatch) {
      language = firstLineMatch[1].toLowerCase();
      codeContent = codeContent.substring(firstLineMatch[0].length);
    }
    
    codeSegments.push({
      code: codeContent,
      lang: language
    });
    
    processedText += placeholder;
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last code block
  processedText += text.substring(lastIndex);
  
  // Process inline code with single backticks
  const inlineCodeRegex = /`([^`]+)`/g;
  let inlineMatch;
  lastIndex = 0;
  let finalText = '';
  
  while ((inlineMatch = inlineCodeRegex.exec(processedText)) !== null) {
    finalText += processedText.substring(lastIndex, inlineMatch.index);
    finalText += `<code>${inlineMatch[1]}</code>`;
    lastIndex = inlineMatch.index + inlineMatch[0].length;
  }
  
  // Add remaining text
  finalText += processedText.substring(lastIndex);
  
  // Replace code block placeholders with actual pre elements
  codeSegments.forEach((codeObj, index) => {
    const placeholder = `__CODE_BLOCK_${index}__`;
    // If language is specified, add it as a class
    const langClass = codeObj.lang ? ` class="language-${codeObj.lang}"` : '';
    finalText = finalText.replace(placeholder, `<pre${langClass}>${codeObj.code}</pre>`);
  });
  
  // Set the HTML content
  element.innerHTML = finalText;
  
  // Start the typewriter effect
  typewriterEffect(element, element.innerHTML);
}
function typewriterEffect(element, html, speed = 10) {
  const originalHTML = html;
  element.innerHTML = "";
  
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
  
  const optionsContainer = document.createElement("div");
  optionsContainer.classList.add("quiz-options");
  
  const questionId = `question-${Math.random().toString(36).substring(7)}`;
  questionContainer.id = questionId;
  
  const topic = extractTopicFromText(question.question);
  initializeDomain(topic);
  
  for (const [key, value] of Object.entries(question.options)) {
    const optionButton = document.createElement("button");
    optionButton.classList.add("quiz-option");
    optionButton.textContent = `${key}: ${value}`;
    optionButton.dataset.option = key;
    
    optionButton.addEventListener("click", function() {
      // Only prevent multiple answers if this question is already answered correctly
      const feedbackElement = this.closest('.quiz-container').querySelector('.quiz-feedback');
      if (feedbackElement && feedbackElement.classList.contains('correct')) {
        return; // Don't allow more attempts if already correct
      }
      
      // Remove previous feedback if it exists (for retries)
      if (feedbackElement) {
        feedbackElement.remove();
      }
      
      // Remove previous skill level indicator if it exists
      let skillLevelContainer = this.closest('.quiz-container').querySelector('.skill-level-container');
      if (skillLevelContainer) {
        skillLevelContainer.remove();
      }
      
      // Check if answer is correct
      const isCorrect = key === question.correct;
      
      // FIXED: Always update the BKT model for both correct and incorrect answers
      // This properly implements the BKT algorithm which should update on all attempts
      const masteryResult = updateMastery(topic, isCorrect);
      
      // Show feedback
      const feedback = document.createElement("div");
      feedback.classList.add("quiz-feedback");
      
      if (isCorrect) {
        feedback.textContent = "Correct! Well done! 🎉";
        feedback.classList.add("correct");
      } else {
        feedback.textContent = `Incorrect. ${question.hint} Try again!`;
        feedback.classList.add("incorrect");
      }
      
      questionContainer.appendChild(feedback);
      
      // Add skill level indicator regardless of correct/incorrect
      // This shows the current estimated mastery after this attempt
      skillLevelContainer = document.createElement("div");
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
      
      if (data.mcq_questions && data.mcq_questions.length > 0) {
        setTimeout(() => {
          addMessage("Let's test your understanding with a few questions:", false);
          
          data.mcq_questions.forEach((question, index) => {
            setTimeout(() => {
              addQuizQuestion(question);
            }, index * 1000);
          });
        }, 1000);
      }
    } else {
      addMessage(`Error: ${data.error}`, false);
    }
  } catch (error) {
    addMessage("Error: Unable to connect to server.", false);
  }
}

// Chat History Functions
function setupChatHistoryControls() {
  const chatControls = document.createElement('div');
  chatControls.className = 'chat-controls';
  
  chatControls.innerHTML = `
    <button id="newChatButton" class="chat-control-button">
      <i class="fas fa-plus"></i> New Chat
    </button>
    <button id="clearChatButton" class="chat-control-button">
      <i class="fas fa-trash"></i> Clear Chat
    </button>
    <button id="viewHistoryButton" class="chat-control-button">
      <i class="fas fa-history"></i> View History
    </button>
  `;
  
  overallProgressText.parentNode.parentNode.appendChild(chatControls);
  
  document.getElementById('newChatButton').addEventListener('click', startNewChat);
  document.getElementById('clearChatButton').addEventListener('click', clearChat);
  document.getElementById('viewHistoryButton').addEventListener('click', showChatHistory);
}

function startNewChat() {
  if (chatHistory.currentChat.length > 0) {
    chatHistory.pastChats.push({
      date: new Date(),
      messages: [...chatHistory.currentChat]
    });
  }
  
  chatHistory.currentChat = [];
  chatBox.innerHTML = '';
  addMessage("New chat started. How can I help you learn today?", false);
}

function clearChat() {
  if (confirm('Clear all chat history and learning progress?')) {
    chatHistory.currentChat = [];
    chatHistory.pastChats = [];
    chatBox.innerHTML = '';
    
    knowledgeData.domains = {};
    knowledgeData.overallMastery = 0;
    knowledgeData.totalQuestions = 0;
    knowledgeData.answeredCorrectly = 0;
    
    updateKnowledgeSidebar();
    addMessage("Chat and learning progress reset. Ready to start fresh!", false);
  }
}

function renderChatMessages(messages) {
  if (messages.length === 0) return '<p>No messages in this chat</p>';
  
  return messages.map(msg => {
    // Process bot messages to handle code blocks and formatting
    let content = msg.text;
    if (!msg.isUser) {
      // Simple handling for code blocks in history view
      content = content.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
      // Handle inline code
      content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    
    return `
      <div class="history-message ${msg.isUser ? 'user' : 'bot'}">
        <div class="message-time">
          ${new Date(msg.timestamp).toLocaleTimeString()}
        </div>
        <div class="message-content">
          ${content}
        </div>
      </div>
    `;
  }).join('');
}

function showChatHistory() {
  // Create modal container
  const historyModal = document.createElement('div');
  historyModal.className = 'history-modal';
  
  // Build tabs for current chat and past chats
  let historyHTML = `
    <div class="modal-content">
      <h3>Chat History</h3>
      <div class="history-tabs">
        <button class="tab-button active" data-tab="current">Current Chat</button>
        ${chatHistory.pastChats.map((chat, i) => 
          `<button class="tab-button" data-tab="past-${i}">
            ${new Date(chat.date).toLocaleString()}
          </button>`
        ).join('')}
      </div>
      <div class="history-content">
        <div id="current-tab" class="tab-content active">
          ${renderChatMessages(chatHistory.currentChat)}
        </div>
        ${chatHistory.pastChats.map((chat, i) => 
          `<div id="past-${i}-tab" class="tab-content">
            ${renderChatMessages(chat.messages)}
          </div>`
        ).join('')}
      </div>
      <button class="close-button">Close</button>
    </div>
  `;
  
  historyModal.innerHTML = historyHTML;
  document.body.appendChild(historyModal);
  
  // Tab switching functionality
  historyModal.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      // Deactivate all tabs
      historyModal.querySelectorAll('.tab-button, .tab-content').forEach(el => {
        el.classList.remove('active');
      });
      
      // Activate selected tab
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
  
  // Close button functionality
  historyModal.querySelector('.close-button').addEventListener('click', () => {
    document.body.removeChild(historyModal);
  });
  
  // Export functionality
  historyModal.querySelector('.export-button').addEventListener('click', () => {
    exportChatHistory();
  });
  
  // Close when clicking outside
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      document.body.removeChild(historyModal);
    }
  });
}

function init() {
  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  updateKnowledgeSidebar();
  setupChatHistoryControls();
  
  setTimeout(() => {
    addMessage("Welcome to the DeepSeek Chat with BKT! I can help you learn about programming concepts, test your knowledge, and track your mastery level across different topics. Ask me anything!", false);
  }, 500);
}

window.addEventListener("load", init);