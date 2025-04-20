document.addEventListener('DOMContentLoaded', function() {
    const startVoiceBtn = document.getElementById('start-voice-btn');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('sendButton');
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported by your browser");
      startVoiceBtn.style.display = 'none';
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    // Configure speech recognition
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Set language
    
    let isListening = false;
    let finalTranscript = '';
    
    // Start/stop listening when the microphone button is clicked
    startVoiceBtn.addEventListener('click', function() {
      if (isListening) {
        recognition.stop();
        startVoiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        startVoiceBtn.classList.remove('listening');
      } else {
        finalTranscript = '';
        recognition.start();
        startVoiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        startVoiceBtn.classList.add('listening');
        
        // Add visual feedback
        chatInput.placeholder = "Listening...";
      }
    });
    
    // Process speech recognition results
    recognition.onresult = function(event) {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Display the recognized text in the input field
      chatInput.value = finalTranscript || interimTranscript;
    };
    
    // Handle end of speech recognition
    recognition.onend = function() {
      isListening = false;
      startVoiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      startVoiceBtn.classList.remove('listening');
      chatInput.placeholder = "Type a message...";
      
      // Auto-send if we have a final transcript
      if (finalTranscript.trim() !== '') {
        // You can uncomment the next line to auto-send messages after voice input
        // sendButton.click();
      }
    };
    
    // Handle start of speech recognition
    recognition.onstart = function() {
      isListening = true;
    };
    
    // Handle errors
    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      isListening = false;
      startVoiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      startVoiceBtn.classList.remove('listening');
      chatInput.placeholder = "Type a message...";
      
      // Show error message
      if (event.error === 'no-speech') {
        chatInput.placeholder = "No speech detected. Try again.";
      } else if (event.error === 'audio-capture') {
        chatInput.placeholder = "No microphone detected.";
      } else if (event.error === 'not-allowed') {
        chatInput.placeholder = "Microphone access denied.";
      }
      
      // Reset placeholder after a delay
      setTimeout(() => {
        chatInput.placeholder = "Type a message...";
      }, 3000);
    };
    
    // Add CSS for the listening state
    const style = document.createElement('style');
    style.textContent = `
      #start-voice-btn.listening {
        background-color: #ff4b4b;
        animation: pulse 1.5s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  });