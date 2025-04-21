document.addEventListener('DOMContentLoaded', function() {
    const ttsButton = document.getElementById('toggle-tts-btn');
    const chatBox = document.getElementById('chat-box');
    
    // TTS state
    const ttsState = {
        enabled: true,
        speechSynthesis: window.speechSynthesis,
        currentUtterance: null,
        voices: [],
        voice: null,
        rate: 1,
        pitch: 1,
        volume: 1
    };
    
    // Check if browser supports speech synthesis
    if (!ttsState.speechSynthesis) {
        console.warn("Text-to-speech not supported by your browser");
        ttsButton.style.display = 'none';
        return;
    }
    
    // Initialize voices - will be populated when voices are loaded
    ttsState.speechSynthesis.onvoiceschanged = function() {
        ttsState.voices = ttsState.speechSynthesis.getVoices();
        // Try to find a natural-sounding voice
        ttsState.voice = ttsState.voices.find(voice => 
            voice.lang.includes('en') && voice.name.includes('Natural')) || 
            ttsState.voices.find(voice => voice.lang.includes('en'));
    };
    
    // Load voices immediately if they're already available
    ttsState.voices = ttsState.speechSynthesis.getVoices();
    if (ttsState.voices.length > 0) {
        ttsState.voice = ttsState.voices.find(voice => 
            voice.lang.includes('en') && voice.name.includes('Natural')) || 
            ttsState.voices.find(voice => voice.lang.includes('en'));
    }
    
    // Toggle TTS on/off
    ttsButton.addEventListener('click', function() {
        ttsState.enabled = !ttsState.enabled;
        
        if (ttsState.enabled) {
            ttsButton.classList.remove('muted');
            ttsButton.classList.add('active');
            ttsButton.title = "Text-to-Speech: ON (Click to turn off)";
        } else {
            ttsButton.classList.remove('active');
            ttsButton.classList.add('muted');
            ttsButton.title = "Text-to-Speech: OFF (Click to turn on)";
            stopSpeaking();
        }
    });
    
    // Initial button state
    ttsButton.classList.add('active');
    ttsButton.title = "Text-to-Speech: ON (Click to turn off)";
    
    // Function to speak text
    function speakText(text) {
        if (!ttsState.enabled || !text) return;
        
        // Skip speaking if it's a quiz question or prompt
        if (text.includes("Let's test your understanding") || 
            text.includes("Correct!") || 
            text.includes("Incorrect.") ||
            text.match(/^[A-D]: /)) {
            return;
        }
        
        stopSpeaking();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = ttsState.voice;
        utterance.rate = ttsState.rate;
        utterance.pitch = ttsState.pitch;
        utterance.volume = ttsState.volume;
        
        utterance.onend = function() {
            ttsState.currentUtterance = null;
        };
        
        utterance.onerror = function(event) {
            console.error('SpeechSynthesis error:', event.error);
            ttsState.currentUtterance = null;
        };
        
        ttsState.speechSynthesis.speak(utterance);
        ttsState.currentUtterance = utterance;
    }
    
    // Function to stop speaking
    function stopSpeaking() {
        if (ttsState.speechSynthesis.speaking) {
            ttsState.speechSynthesis.cancel();
        }
        ttsState.currentUtterance = null;
    }
    
    // Modify the addMessage function to trigger TTS for bot messages
    const originalAddMessage = window.addMessage;
    
    window.addMessage = function(message, isUser) {
        originalAddMessage(message, isUser);
        
        if (!isUser) {
            // For formatted messages, we need to extract the text content
            let textContent = message;
            
            // If it's HTML, create a temporary element to get text
            if (message.includes('<')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = message;
                textContent = tempDiv.textContent || tempDiv.innerText || '';
            }
            
            // Clean up the text - remove code blocks and extra whitespace
            textContent = textContent
                .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                .replace(/`[^`]+`/g, '')       // Remove inline code
                .replace(/\s+/g, ' ')           // Collapse whitespace
                .trim();
            
            // Only speak if there's meaningful content
            if (textContent.length > 10) { // Minimum length to avoid speaking short confirmations
                speakText(textContent);
            }
        }
    };
    
    // Stop speaking when new chat starts or chat is cleared
    const originalStartNewChat = window.startNewChat;
    window.startNewChat = function() {
        stopSpeaking();
        originalStartNewChat();
    };
    
    const originalClearChat = window.clearChat;
    window.clearChat = function() {
        stopSpeaking();
        originalClearChat();
    };
    
    // Pause TTS when voice recording starts
    const startVoiceBtn = document.getElementById('start-voice-btn');
    if (startVoiceBtn) {
        startVoiceBtn.addEventListener('click', function() {
            if (window.isListening) {
                // If we're stopping recording, don't do anything
                return;
            }
            // If starting recording, pause TTS
            stopSpeaking();
        });
    }
    
    // Add keyboard shortcut to toggle TTS (Ctrl+Alt+S)
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.altKey && event.key === 's') {
            event.preventDefault();
            ttsButton.click();
        }
    });
});