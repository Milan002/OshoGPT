document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const thinkingToggle = document.getElementById('thinking-toggle');
    
    // Track visibility state
    let showThinking = false;
    
    // Toggle thinking visibility when the dropdown is clicked
    thinkingToggle.addEventListener('click', () => {
        showThinking = !showThinking;
        
        // Update toggle appearance
        if (showThinking) {
            thinkingToggle.classList.add('active');
        } else {
            thinkingToggle.classList.remove('active');
        }
        
        // Update visibility of all thinking sections with smooth transition
        document.querySelectorAll('.thinking-section').forEach(section => {
            if (showThinking) {
                section.classList.add('visible');
            } else {
                section.classList.remove('visible');
            }
        });
        
        // Save preference to localStorage
        localStorage.setItem('showThinking', showThinking);
    });
    
    // Load user preference from localStorage
    const savedThinkingPref = localStorage.getItem('showThinking');
    if (savedThinkingPref !== null) {
        showThinking = savedThinkingPref === 'true';
        
        // Apply saved preference to the toggle appearance
        if (showThinking) {
            thinkingToggle.classList.add('active');
        }
        
        // Apply preference to any existing thinking sections
        document.querySelectorAll('.thinking-section').forEach(section => {
            if (showThinking) {
                section.classList.add('visible');
            } else {
                section.classList.remove('visible');
            }
        });
    }
    
    // Focus input on load with animation
    setTimeout(() => {
        userInput.focus();
    }, 500);
    
    // Typing indicator function
    const createTypingIndicator = () => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            typingDiv.appendChild(dot);
        }
        
        return typingDiv;
    };
    
    // Send message function
    const sendMessage = async () => {
        const prompt = userInput.value.trim();
        if (!prompt) return;
        
        // Disable input while processing
        userInput.disabled = true;
        sendButton.disabled = true;
        
        // Add user message to chat
        addMessage(prompt, 'user');
        
        // Clear input
        userInput.value = '';
        
        // Create Osho message container for streaming response
        const messageDiv = document.createElement('div');
        messageDiv.className = 'osho-message';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        
        const avatar = document.createElement('img');
        avatar.src = 'static/images/osho.jpeg'; // Update Osho avatar here
        avatar.alt = 'Osho';
        
        avatarDiv.appendChild(avatar);
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message';
        
        // Add typing indicator first
        const typingIndicator = createTypingIndicator();
        messageContent.appendChild(typingIndicator);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(messageContent);
        
        chatHistory.appendChild(messageDiv);
        
        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Create paragraph for actual text (will replace typing indicator)
        const paragraph = document.createElement('p');
        paragraph.textContent = ''; // Will be populated with streaming text
        
        // Create container for potential thinking sections
        const thinkingContainer = document.createElement('div');
        thinkingContainer.className = 'thinking-section';
        if (showThinking) {
            thinkingContainer.classList.add('visible');
        }
        
        const thinkingHeader = document.createElement('div');
        thinkingHeader.className = 'thinking-header';
        thinkingHeader.textContent = 'Thinking:';
        
        const thinkingContent = document.createElement('div');
        thinkingContent.className = 'thinking-content';
        
        thinkingContainer.appendChild(thinkingHeader);
        thinkingContainer.appendChild(thinkingContent);
        
        // Track if thinking was added
        let hasThinking = false;
        let isFirstChunk = true;
        
        try {
            // Use fetch with streaming to get response chunks
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Process the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            
            while (true) {
                const { value, done } = await reader.read();
                
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // Process complete JSON objects from buffer
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, newlineIndex);
                    buffer = buffer.slice(newlineIndex + 1);
                    
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            
                            // Replace typing indicator with actual paragraph on first chunk
                            if (isFirstChunk && (data.chunk || data.thinking)) {
                                messageContent.removeChild(typingIndicator);
                                messageContent.appendChild(paragraph);
                                messageContent.appendChild(thinkingContainer);
                                isFirstChunk = false;
                            }
                            
                            // Update response text with new chunk
                            if (data.chunk) {
                                // Simulate a more human-like typing experience
                                const delay = Math.min(data.chunk.length * 10, 30);
                                setTimeout(() => {
                                    paragraph.textContent += data.chunk;
                                    chatHistory.scrollTop = chatHistory.scrollHeight;
                                }, delay);
                            } else if (data.thinking) {
                                // Add thinking content
                                hasThinking = true;
                                const thinkingText = document.createTextNode(data.thinking);
                                thinkingContent.appendChild(thinkingText);
                            } else if (data.error) {
                                if (isFirstChunk) {
                                    messageContent.removeChild(typingIndicator);
                                    messageContent.appendChild(paragraph);
                                    isFirstChunk = false;
                                }
                                paragraph.textContent = 'Ah, the technology betrays us! My wisdom cannot flow through these digital pipes at the moment. Try again later, or perhaps meditate on the beauty of server errors.';
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e, line);
                        }
                    }
                }
            }
            
            // Hide thinking container if empty
            if (!hasThinking) {
                thinkingContainer.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error:', error);
            // Remove typing indicator and show error
            if (messageContent.contains(typingIndicator)) {
                messageContent.removeChild(typingIndicator);
                messageContent.appendChild(paragraph);
            }
            paragraph.textContent = 'Ah, the technology betrays us! My wisdom cannot flow through these digital pipes at the moment. Try again later, or perhaps meditate on the beauty of server errors.';
        } finally {
            // Enable input again
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    };
    
    // Add message to chat history
    const addMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'osho-message';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        
        const avatar = document.createElement('img');
        if (sender === 'user') {
            avatar.src = 'static/images/dazai.jpg'; // Dazai anime avatar
        } else {
            avatar.src = 'static/images/osho.jpeg'; // Osho avatar
        }
        avatar.alt = sender === 'user' ? 'Dazai' : 'Osho';
        
        avatarDiv.appendChild(avatar);
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        messageContent.appendChild(paragraph);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(messageContent);
        
        chatHistory.appendChild(messageDiv);
        
        // Scroll to bottom with smooth animation
        setTimeout(() => {
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 100);
    };
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea as user types
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        const newHeight = Math.min(userInput.scrollHeight, 150);
        if (newHeight > 65) {
            userInput.style.height = newHeight + 'px';
        }
    });
});