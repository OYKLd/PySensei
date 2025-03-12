const API_KEY = 'AIzaSyDhwKU24_ulbjsBlbOHLpErh-2OygCx8yE';
//remplacer par votre clé API 

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const chatMessages = document.getElementById('chat-messages');

const userInput = document.getElementById('user-input');

const sendButton = document.getElementById('send-button');

async function generateResponse(prompt) {
    // Ajoutez des instructions spécifiques au domaine
    const systemInstruction = "Tu es un enseignant uniquement dans le langage de programmation python. Tu réponds seulement aux questions concernant ce langage, si on te pose une question en dehors tu ramènes poliment la discussion au langage de programmation python. Tu réponds avec un français simple, fait l'effort de ne pas dépasser 150 mots.";
    
    const fullPrompt = systemInstruction + "\n\nQuestion de l'utilisateur: " + prompt;
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: fullPrompt
                        }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to generate response');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function cleanMarkdown(text) {
    return text
        .replace(/#{1,6}\s?/g, '')

        .replace(/\*\*/g, '')

        .replace(/\n{3,}/g, '\n\n')

        .trim();
}

function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');

    profileImage.src = isUser ? 'user.avif' : 'bot.jpg';

    profileImage.alt = isUser ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    messageContent.textContent = message;

    messageElement.appendChild(profileImage);
    messageElement.appendChild(messageContent);

    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleUserInput() {
    const userMessage = userInput.value.trim();

    if (userMessage) {
        addMessage(userMessage, true);

        userInput.value = '';

        sendButton.disabled = true;
        userInput.disabled = true;

        try {
            const botMessage = await generateResponse(userMessage);

            addMessage(cleanMarkdown(botMessage), false);
        } catch (error) {
            console.error('Error:', error);

            addMessage('Sorry, I encountered an error. Please try again.', false);
        } finally {
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus();
        }
    }
}

sendButton.addEventListener('click', handleUserInput);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        handleUserInput();
    }
});
