const chatBox = document.getElementById("chat-box")
const chatInput = document.getElementById("chat-input")
const sendButton = document.getElementById("sendButton")

function addMessage(message, isUser) {
  const messageElement = document.createElement("div")
  messageElement.classList.add(isUser ? "user-message" : "bot-message")
  chatBox.appendChild(messageElement)

  if (isUser) {
    messageElement.textContent = message
    scrollToBottom()
  } else {
    typewriterEffect(messageElement, message)
  }
}

function typewriterEffect(element, text, speed = 30) {
  let i = 0
  const timer = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i)
      i++
      scrollToBottom()
    } else {
      clearInterval(timer)
    }
  }, speed)
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight
}

function addQuizQuestion(question) {
  try {
    const questionContainer = document.createElement("div")
    questionContainer.classList.add("quiz-container")
    
    const questionText = document.createElement("div")
    questionText.classList.add("quiz-question")
    questionText.textContent = question.question
    questionContainer.appendChild(questionText)
    
    // Create option buttons
    const optionsContainer = document.createElement("div")
    optionsContainer.classList.add("quiz-options")
    
    // Generate a unique ID for the question
    questionContainer.id = `question-${Math.random().toString(36).substring(7)}`
    
    // Ensure we have options
    const options = question.options || {}
    
    // Make sure we have at least some options
    if (Object.keys(options).length === 0) {
      options.A = "Option A"
      options.B = "Option B"
      options.C = "Option C"
      options.D = "Option D"
    }
    
    // Make sure we have a correct answer
    const correctAnswer = question.correct || "A"
    
    // Make sure we have a hint
    const hint = question.hint || "Try reviewing the information again."
    
    for (const [key, value] of Object.entries(options)) {
      const optionButton = document.createElement("button")
      optionButton.classList.add("quiz-option")
      optionButton.textContent = `${key}: ${value}`
      optionButton.dataset.option = key
      
      optionButton.addEventListener("click", function() {
        // Remove selected class from all options
        document.querySelectorAll(`.quiz-option[data-question-id="${questionContainer.id}"]`).forEach(btn => {
          btn.classList.remove("selected")
        })
        
        // Add selected class to this option
        this.classList.add("selected")
        
        // Check if answer is correct
        const isCorrect = key === correctAnswer
        
        // Remove previous feedback if any
        const previousFeedback = questionContainer.querySelector(".quiz-feedback")
        if (previousFeedback) {
          previousFeedback.remove()
        }
        
        // Show feedback
        const feedback = document.createElement("div")
        feedback.classList.add("quiz-feedback")
        
        if (isCorrect) {
          feedback.textContent = "Correct! Well done! 🎉"
          feedback.classList.add("correct")
        } else {
          feedback.textContent = `Incorrect. ${hint}`
          feedback.classList.add("incorrect")
        }
        
        questionContainer.appendChild(feedback)
        scrollToBottom()
      })
      
      // Add question ID to each option for selection handling
      optionButton.dataset.questionId = questionContainer.id
      
      optionsContainer.appendChild(optionButton)
    }
    
    questionContainer.appendChild(optionsContainer)
    chatBox.appendChild(questionContainer)
    scrollToBottom()
  } catch (error) {
    console.error("Error adding quiz question:", error)
    // Add a generic question if something goes wrong
    addMessage("I wanted to add a quiz question here, but encountered an error. Let's continue our conversation!", false)
  }
}
async function sendMessage() {
  const userMessage = chatInput.value.trim()
  if (!userMessage) return

  addMessage(userMessage, true)
  chatInput.value = ""
  
  // Disable input while processing
  chatInput.disabled = true
  sendButton.disabled = true

  try {
    const response = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ message: userMessage }),
    })

    const data = await response.json()
    if (response.ok) {
      addMessage(data.response.trim(), false)
      
      // Add MCQ questions after a short delay
      if (data.mcq_questions && data.mcq_questions.length > 0) {
        setTimeout(() => {
          addMessage("Let's test your understanding with a few questions:", false)
          
          // Add each question one by one with delays
          data.mcq_questions.forEach((question, index) => {
            // Validate question format before adding
            if (question && question.question && question.options) {
              setTimeout(() => {
                addQuizQuestion(question)
              }, index * 1000) // 1-second delay between questions
            }
          })
        }, 1000) // 1-second delay after the main response
      }
    } else {
      addMessage(`Error: ${data.error || "Unknown server error"}`, false)
    }
  } catch (error) {
    console.error("Chat error:", error)
    addMessage("Error: Unable to connect to server. Please try again later.", false)
  } finally {
    // Re-enable input
    chatInput.disabled = false
    sendButton.disabled = false
    chatInput.focus()
  }
}
sendButton.addEventListener("click", sendMessage)
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage()
  }
})

// Add a welcome message
window.addEventListener("load", () => {
  setTimeout(() => {
    addMessage("Welcome to the chat! How can I assist you today?", false)
  }, 500)
})