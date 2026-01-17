// Atlas AI - Self-Learning Personal Assistant
// Main Application Logic

// Initialize variables
let isRecording = false;
let knowledgeBase = [];
let reminders = [];
let contacts = [];
let settings = {};
let chatHistory = [];

// DOM Elements
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const knowledgeList = document.getElementById('knowledgeList');
const remindersList = document.getElementById('remindersList');
const contactsList = document.getElementById('contactsList');
const learningProgress = document.getElementById('learningProgress');
const progressPercentage = document.getElementById('progressPercentage');

// Default knowledge
const defaultKnowledge = [
    { text: "You prefer meetings in the morning", confidence: "High", category: "preference", timestamp: new Date().toISOString() },
    { text: "'Prep notes' means create meeting summary", confidence: "Medium", category: "command", timestamp: new Date().toISOString() },
    { text: "John is your main work contact", confidence: "High", category: "contact", timestamp: new Date().toISOString() },
    { text: "You usually check emails at 9 AM", confidence: "Medium", category: "routine", timestamp: new Date().toISOString() }
];

// Default contacts
const defaultContacts = [
    { id: 'john', name: 'John Doe', status: 'Favorite', lastContact: '2 hours ago', phone: '+1234567890' },
    { id: 'sarah', name: 'Sarah Smith', status: 'Work', lastContact: 'Yesterday', phone: '+1234567891' },
    { id: 'mike', name: 'Mike Johnson', status: 'Online', lastContact: '3 days ago', phone: '+1234567892' },
    { id: 'emily', name: 'Emily Davis', status: 'Family', lastContact: '1 week ago', phone: '+1234567893' },
    { id: 'alex', name: 'Alex Wilson', status: 'Friend', lastContact: '2 weeks ago', phone: '+1234567894' }
];

// Default reminders
const defaultReminders = [
    { id: '1', title: "Call dentist", description: "Annual dental checkup", time: new Date(Date.now() + 3600000).toISOString(), repeat: "none", completed: false, icon: "fa-phone" },
    { id: '2', title: "Submit report", description: "Q4 financial report", time: new Date(Date.now() + 86400000).toISOString(), repeat: "none", completed: false, icon: "fa-file" },
    { id: '3', title: "Gym session", description: "Morning workout", time: new Date(Date.now() + 28800000).toISOString(), repeat: "daily", completed: false, icon: "fa-dumbbell" }
];

// Default settings
const defaultSettings = {
    assistantName: "Atlas AI",
    learningSensitivity: "medium",
    voiceResponse: "off",
    theme: "dark",
    notifications: true,
    autoSave: true
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Atlas AI Assistant Initializing...');
    
    // Load all data from localStorage
    loadSettings();
    loadKnowledgeBase();
    loadContacts();
    loadReminders();
    loadChatHistory();
    
    // Initialize UI
    updateKnowledgeList();
    updateRemindersList();
    updateContactsList();
    updateLearningProgress();
    
    // Add welcome message
    setTimeout(() => {
        addMessage('ai', "Hello! I'm Atlas, your self-learning AI assistant. I can help you with WhatsApp messages, reminders, tasks, and more. I learn from our conversations to serve you better! How can I assist you today?");
    }, 500);
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('Atlas AI Assistant Ready!');
});

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('atlasSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    } else {
        settings = { ...defaultSettings };
        localStorage.setItem('atlasSettings', JSON.stringify(settings));
    }
    
    // Apply settings
    applySettings();
}

// Apply current settings
function applySettings() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Update assistant name if needed
    const titleElements = document.querySelectorAll('.chat-title, .logo-text');
    titleElements.forEach(el => {
        if (el.classList.contains('logo-text')) {
            el.textContent = settings.assistantName;
        }
    });
}

// Load knowledge base from localStorage
function loadKnowledgeBase() {
    const savedKnowledge = localStorage.getItem('atlasKnowledge');
    if (savedKnowledge) {
        knowledgeBase = JSON.parse(savedKnowledge);
    } else {
        knowledgeBase = [...defaultKnowledge];
        localStorage.setItem('atlasKnowledge', JSON.stringify(knowledgeBase));
    }
}

// Load contacts from localStorage
function loadContacts() {
    const savedContacts = localStorage.getItem('atlasContacts');
    if (savedContacts) {
        contacts = JSON.parse(savedContacts);
    } else {
        contacts = [...defaultContacts];
        localStorage.setItem('atlasContacts', JSON.stringify(contacts));
    }
}

// Load reminders from localStorage
function loadReminders() {
    const savedReminders = localStorage.getItem('atlasReminders');
    if (savedReminders) {
        reminders = JSON.parse(savedReminders);
    } else {
        reminders = [...defaultReminders];
        localStorage.setItem('atlasReminders', JSON.stringify(reminders));
    }
}

// Load chat history from localStorage
function loadChatHistory() {
    const savedHistory = localStorage.getItem('atlasChatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        // Display chat history
        chatHistory.forEach(msg => {
            displayMessage(msg.sender, msg.text, msg.timestamp);
        });
    }
}

// Update knowledge list display
function updateKnowledgeList() {
    knowledgeList.innerHTML = '';
    const recentKnowledge = [...knowledgeBase]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 4); // Show last 4
    
    recentKnowledge.forEach(item => {
        const li = document.createElement('li');
        li.className = 'knowledge-item';
        li.innerHTML = `
            <div class="knowledge-text">${item.text}</div>
            <div class="knowledge-confidence">${item.confidence}</div>
        `;
        knowledgeList.appendChild(li);
    });
}

// Update reminders list display
function updateRemindersList() {
    remindersList.innerHTML = '';
    const upcomingReminders = reminders
        .filter(r => !r.completed && new Date(r.time) > new Date())
        .sort((a, b) => new Date(a.time) - new Date(b.time))
        .slice(0, 3); // Show next 3
    
    upcomingReminders.forEach(reminder => {
        const li = document.createElement('li');
        li.className = 'reminder-item';
        li.innerHTML = `
            <div class="reminder-icon">
                <i class="fas ${reminder.icon}"></i>
            </div>
            <div class="reminder-info">
                <div class="reminder-title">${reminder.title}</div>
                <div class="reminder-time">${formatDateTime(reminder.time)}</div>
            </div>
            <button class="action-icon-small" onclick="completeReminder('${reminder.id}')" title="Mark as completed">
                <i class="fas fa-check"></i>
            </button>
        `;
        remindersList.appendChild(li);
    });
    
    // If no reminders, show message
    if (upcomingReminders.length === 0) {
        const li = document.createElement('li');
        li.className = 'reminder-item';
        li.innerHTML = `
            <div class="reminder-info">
                <div class="reminder-title">No upcoming reminders</div>
                <div class="reminder-time">Add a reminder to get started</div>
            </div>
        `;
        remindersList.appendChild(li);
    }
}

// Update contacts list display
function updateContactsList() {
    contactsList.innerHTML = '';
    contacts.forEach(contact => {
        const li = document.createElement('li');
        li.className = 'contact-item';
        li.innerHTML = `
            <div class="contact-avatar">
                ${contact.name.charAt(0)}
            </div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-status">${contact.status} • ${contact.lastContact}</div>
            </div>
        `;
        li.onclick = () => selectContact(contact.id);
        contactsList.appendChild(li);
    });
}

// Update learning progress
function updateLearningProgress() {
    const totalItems = knowledgeBase.length;
    const progress = Math.min(totalItems * 8, 100); // 8% per knowledge item, max 100%
    learningProgress.style.width = `${progress}%`;
    progressPercentage.textContent = `${progress}%`;
}

// Setup event listeners
function setupEventListeners() {
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key (but allow Shift+Enter for new line)
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Focus on input when page loads
    chatInput.focus();
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
        return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days < 7) {
        return `${date.toLocaleDateString([], { weekday: 'short' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
}

// Add message to chat
function addMessage(sender, text) {
    const timestamp = new Date().toISOString();
    displayMessage(sender, text, timestamp);
    
    // Save to chat history
    chatHistory.push({ sender, text, timestamp });
    if (chatHistory.length > 50) { // Keep only last 50 messages
        chatHistory = chatHistory.slice(-50);
    }
    localStorage.setItem('atlasChatHistory', JSON.stringify(chatHistory));
    
    // Process the message if from user
    if (sender === 'user') {
        setTimeout(() => processUserMessage(text), 1000);
    }
}

// Display message in chat
function displayMessage(sender, text, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatar = sender === 'user' ? 'user-avatar' : 'ai-avatar';
    const avatarIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
    
    messageDiv.innerHTML = `
        <div class="message-avatar ${avatar}">
            <i class="fas ${avatarIcon}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
            ${sender === 'ai' ? `
            <div class="message-actions">
                <button class="action-icon-small" onclick="learnFromMessage('${text.replace(/'/g, "\\'")}')" title="Save for learning">
                    <i class="fas fa-save"></i>
                </button>
                <button class="action-icon-small" title="Mark as important">
                    <i class="fas fa-star"></i>
                </button>
            </div>
            ` : ''}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message function
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage('user', message);
    chatInput.value = '';
    chatInput.style.height = 'auto';
}

// Process user message for commands
function processUserMessage(message) {
    const lowerMsg = message.toLowerCase();
    
    // Check for WhatsApp command
    if (lowerMsg.includes('whatsapp') || lowerMsg.includes('send message') || lowerMsg.includes('message')) {
        handleWhatsAppCommand(message, lowerMsg);
        return;
    }
    
    // Check for reminder command
    if (lowerMsg.includes('remind') || lowerMsg.includes('reminder') || lowerMsg.includes('remember')) {
        handleReminderCommand(message);
        return;
    }
    
    // Check for task command
    if (lowerMsg.includes('task') || lowerMsg.includes('todo') || lowerMsg.includes('to-do')) {
        handleTaskCommand(message);
        return;
    }
    
    // Check for learning command
    if (lowerMsg.includes('learn') || lowerMsg.includes('teach') || lowerMsg.includes('remember that')) {
        handleLearningCommand(message);
        return;
    }
    
    // Check for contact command
    if (lowerMsg.includes('contact') || lowerMsg.includes('person') || lowerMsg.includes('friend')) {
        handleContactCommand(message);
        return;
    }
    
    // Default AI response
    const responses = [
        "I've processed your request. Is there anything specific you'd like me to do?",
        "Noted. I'll remember that for future reference.",
        "Understood. I can help with WhatsApp messages, reminders, tasks, and more.",
        "I'm learning from our conversation. Could you clarify what you'd like me to do?",
        "Got it! How else can I assist you today?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addMessage('ai', randomResponse);
    
    // Analyze for passive learning
    analyzeForLearning(message);
}

// Handle WhatsApp commands
function handleWhatsAppCommand(message, lowerMsg) {
    // Extract contact name
    const contactNames = contacts.map(c => c.name.toLowerCase());
    const foundContact = contactNames.find(name => lowerMsg.includes(name.split(' ')[0]));
    
    if (foundContact) {
        const contact = contacts.find(c => c.name.toLowerCase().includes(foundContact));
        // Extract message text
        const colonIndex = message.indexOf(':');
        const msgText = colonIndex !== -1 ? message.substring(colonIndex + 1).trim() : 
                       message.split('to')[1] ? message.split('to')[1].split(' ').slice(1).join(' ') : 
                       "Meeting reminder";
        
        addMessage('ai', `I'll send a WhatsApp message to ${contact.name}: "${msgText}". Should I proceed?`);
        addToKnowledge(`You often message ${contact.name} on WhatsApp about: ${msgText.substring(0, 30)}...`, 'contact');
        
        // In a real app, you would integrate with WhatsApp API here
        showNotification(`Message to ${contact.name} prepared. Click Send in WhatsApp modal to confirm.`);
    } else {
        addMessage('ai', "I can send WhatsApp messages. Who would you like to message?");
        setTimeout(() => openWhatsAppModal(), 1500);
    }
}

// Handle reminder commands
function handleReminderCommand(message) {
    // Extract time and task from message
    const timeMatches = message.match(/\b(at|on|tomorrow|today|next week)\b\s+([^.,!?]+)/i);
    const task = message.replace(/\b(remind|me|to|about|that)\b/gi, '').replace(/\b(at|on|tomorrow|today|next week)\b\s+([^.,!?]+)/i, '').trim();
    
    if (task && timeMatches) {
        addMessage('ai', `I'll set a reminder for "${task}" ${timeMatches[0]}.`);
        // Auto-fill reminder modal
        document.getElementById('reminderTitle').value = task;
        document.getElementById('reminderDesc').value = `Auto-generated from: "${message}"`;
        openReminderModal();
    } else {
        addMessage('ai', "I can set a reminder for you. What should I remind you about and when?");
        setTimeout(() => openReminderModal(), 1500);
    }
}

// Handle task commands
function handleTaskCommand(message) {
    const task = message.replace(/\b(task|todo|to-do|create|add)\b/gi, '').trim();
    if (task) {
        addMessage('ai', `I'll add "${task}" to your tasks.`);
        showNotification(`Task "${task}" added to your list.`);
        addToKnowledge(`You often create tasks about: ${task.substring(0, 30)}...`, 'routine');
    } else {
        addMessage('ai', "I can help you create tasks. What task would you like to add?");
        setTimeout(() => openTaskModal(), 1500);
    }
}

// Handle learning commands
function handleLearningCommand(message) {
    const learning = message.replace(/\b(learn|teach|remember that)\b/gi, '').trim();
    if (learning) {
        addMessage('ai', `I'll remember that: "${learning}"`);
        addToKnowledge(learning, 'command');
    } else {
        addMessage('ai', "What would you like me to learn?");
        setTimeout(() => openLearningModal(), 1500);
    }
}

// Handle contact commands
function handleContactCommand(message) {
    addMessage('ai', "I can help you manage contacts. You can add new contacts in the WhatsApp section.");
    setTimeout(() => openWhatsAppModal(), 1500);
}

// Analyze message for passive learning
function analyzeForLearning(message) {
    const lowerMsg = message.toLowerCase();
    
    if (settings.learningSensitivity === 'low') return;
    
    // Check for patterns to learn (medium sensitivity)
    if (settings.learningSensitivity === 'medium' || settings.learningSensitivity === 'high') {
        if (lowerMsg.includes('i prefer') || lowerMsg.includes('i like') || lowerMsg.includes('i usually')) {
            addToKnowledge(message, 'preference');
        }
        
        if (lowerMsg.includes('my name is') || lowerMsg.includes('call me')) {
            addToKnowledge(`User name reference: ${message}`, 'contact');
        }
        
        if (lowerMsg.includes('means') || lowerMsg.includes('refers to')) {
            addToKnowledge(message, 'command');
        }
    }
    
    // High sensitivity - learn from everything
    if (settings.learningSensitivity === 'high') {
        // Extract key phrases
        const phrases = message.split(/[.,!?;]/).filter(p => p.length > 10);
        phrases.forEach(phrase => {
            if (phrase.length > 20 && Math.random() > 0.7) { // 30% chance to learn each phrase
                addToKnowledge(phrase.trim(), 'conversation');
            }
        });
    }
}

// Add to knowledge base
function addToKnowledge(text, category) {
    const newKnowledge = {
        text: text,
        confidence: "Medium",
        category: category,
        timestamp: new Date().toISOString()
    };
    
    knowledgeBase.push(newKnowledge);
    updateKnowledgeList();
    updateLearningProgress();
    
    // Save to localStorage
    localStorage.setItem('atlasKnowledge', JSON.stringify(knowledgeBase));
    
    // Show notification for important learnings
    if (category === 'command' || category === 'preference') {
        showNotification(`New knowledge added: "${text.substring(0, 40)}..."`);
    }
}

// Voice recording toggle
function toggleVoiceRecording() {
    isRecording = !isRecording;
    voiceBtn.classList.toggle('recording', isRecording);
    voiceBtn.innerHTML = isRecording ? '<i class="fas fa-stop"></i>' : '<i class="fas fa-microphone"></i>';
    voiceStatus.textContent = isRecording ? 'Listening... Speak now' : 'Click to speak';
    
    if (isRecording) {
        // Simulate voice recognition
        setTimeout(() => {
            const voiceCommands = [
                "Send WhatsApp to John: Meeting at 3 PM",
                "Remind me to call mom tomorrow at 5 PM",
                "What's on my schedule today?",
                "Create a task: Finish the project report",
                "Learn that when I say 'busy day' it means I have back-to-back meetings"
            ];
            
            const command = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
            addMessage('user', command);
            
            // Stop recording after processing
            toggleVoiceRecording();
        }, 2000);
    }
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openWhatsAppModal() {
    openModal('whatsappModal');
    // Set default time to now + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('whatsappSchedule').value = now.toISOString().slice(0, 16);
}

function openReminderModal() {
    openModal('reminderModal');
    // Set default time to now + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('reminderTime').value = now.toISOString().slice(0, 16);
}

function openTaskModal() {
    // For simplicity, using reminder modal for tasks
    document.getElementById('reminderTitle').placeholder = "e.g., Finish project report";
    document.getElementById('reminderModal').querySelector('.modal-title').textContent = "Create New Task";
    openReminderModal();
}

function openLearningModal() {
    openModal('learningModal');
}

function openSettingsModal() {
    // Load current settings into form
    document.getElementById('assistantName').value = settings.assistantName;
    document.getElementById('learningSensitivity').value = settings.learningSensitivity;
    document.getElementById('voiceResponse').value = settings.voiceResponse;
    document.getElementById('themeSelect').value = settings.theme;
    
    openModal('settingsModal');
}

// Send WhatsApp message
function sendWhatsApp() {
    const contact = document.getElementById('whatsappContact').value;
    const message = document.getElementById('whatsappMessage').value;
    const schedule = document.getElementById('whatsappSchedule').value;
    
    if (!message) {
        showNotification("Please enter a message", "warning");
        return;
    }
    
    const contactName = document.getElementById('whatsappContact').selectedOptions[0].text.split(' (')[0];
    
    addMessage('ai', `WhatsApp message to ${contactName} scheduled: "${message}"`);
    addToKnowledge(`You often message ${contactName} about: ${message.substring(0, 30)}...`, 'contact');
    
    closeModal('whatsappModal');
    showNotification(`Message to ${contactName} scheduled successfully!`);
    
    // Clear form
    document.getElementById('whatsappMessage').value = '';
    
    // In a real application, this would integrate with WhatsApp Web API
    console.log(`WhatsApp Message Prepared:
    To: ${contactName}
    Message: ${message}
    Scheduled: ${schedule ? new Date(schedule).toLocaleString() : 'Immediately'}
    `);
}

// Set reminder
function setReminder() {
    const title = document.getElementById('reminderTitle').value;
    const desc = document.getElementById('reminderDesc').value;
    const time = document.getElementById('reminderTime').value;
    const repeat = document.getElementById('reminderRepeat').value;
    
    if (!title || !time) {
        showNotification("Please fill in required fields", "warning");
        return;
    }
    
    const newReminder = {
        id: 'reminder_' + Date.now(),
        title: title,
        description: desc,
        time: time,
        repeat: repeat,
        completed: false,
        icon: getReminderIcon(title)
    };
    
    reminders.push(newReminder);
    updateRemindersList();
    
    // Save to localStorage
    localStorage.setItem('atlasReminders', JSON.stringify(reminders));
    
    addMessage('ai', `Reminder set: "${title}" at ${formatDateTime(time)}`);
    addToKnowledge(`You set reminders for: ${title}`, 'routine');
    
    closeModal('reminderModal');
    showNotification("Reminder set successfully!");
    
    // Clear form
    document.getElementById('reminderTitle').value = '';
    document.getElementById('reminderDesc').value = '';
    document.getElementById('reminderModal').querySelector('.modal-title').textContent = "Set Reminder";
    document.getElementById('reminderTitle').placeholder = "e.g., Call doctor";
}

// Get appropriate icon for reminder based on title
function getReminderIcon(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('call') || lowerTitle.includes('phone')) return 'fa-phone';
    if (lowerTitle.includes('email') || lowerTitle.includes('mail')) return 'fa-envelope';
    if (lowerTitle.includes('meeting') || lowerTitle.includes('appointment')) return 'fa-calendar';
    if (lowerTitle.includes('gym') || lowerTitle.includes('workout')) return 'fa-dumbbell';
    if (lowerTitle.includes('buy') || lowerTitle.includes('shop')) return 'fa-shopping-cart';
    if (lowerTitle.includes('submit') || lowerTitle.includes('report')) return 'fa-file';
    return 'fa-bell';
}

// Complete reminder
function completeReminder(reminderId) {
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
        reminder.completed = true;
        updateRemindersList();
        localStorage.setItem('atlasReminders', JSON.stringify(reminders));
        showNotification(`Reminder "${reminder.title}" completed!`);
    }
}

// Save learning
function saveLearning() {
    const input = document.getElementById('learningInput').value;
    const category = document.getElementById('learningCategory').value;
    const priority = document.getElementById('learningPriority').value;
    
    if (!input) {
        showNotification("Please enter something to teach me", "warning");
        return;
    }
    
    addToKnowledge(input, category);
    addMessage('ai', "Thank you for teaching me! I've saved this to my memory.");
    
    closeModal('learningModal');
    document.getElementById('learningInput').value = '';
}

// Save settings
function saveSettings() {
    settings.assistantName = document.getElementById('assistantName').value;
    settings.learningSensitivity = document.getElementById('learningSensitivity').value;
    settings.voiceResponse = document.getElementById('voiceResponse').value;
    settings.theme = document.getElementById('themeSelect').value;
    
    localStorage.setItem('atlasSettings', JSON.stringify(settings));
    applySettings();
    
    closeModal('settingsModal');
    showNotification("Settings saved successfully!");
    
    // Update UI with new assistant name
    document.querySelector('.logo-text').textContent = settings.assistantName;
}

// Reset settings to default
function resetSettings() {
    if (confirm("Reset all settings to default?")) {
        settings = { ...defaultSettings };
        localStorage.setItem('atlasSettings', JSON.stringify(settings));
        applySettings();
        showNotification("Settings reset to default!");
        closeModal('settingsModal');
    }
}

// Learn from specific message
function learnFromMessage(text) {
    document.getElementById('learningInput').value = `When you say: "${text}", it means...`;
    openModal('learningModal');
}

// Quick tasks
function quickTask(task) {
    const tasks = {
        weather: "The weather today is 72°F and sunny. Perfect day for outdoor activities!",
        news: "Top news: Tech conference announced, Market updates positive, New AI breakthroughs reported.",
        schedule: "Today's schedule: 10 AM Team Meeting, 2 PM Client Call, 4 PM Gym Session."
    };
    
    addMessage('user', `Show me ${task}`);
    setTimeout(() => {
        addMessage('ai', tasks[task]);
    }, 1000);
}

// Select contact
function selectContact(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    chatInput.value = `Send WhatsApp to ${contact.name}: `;
    chatInput.focus();
    chatInput.setSelectionRange(chatInput.value.length, chatInput.value.length);
}

// Start voice command
function startVoiceCommand() {
    if (!isRecording) {
        toggleVoiceRecording();
    }
}

// Clear chat
function clearChat() {
    if (confirm("Clear all chat messages? This will not delete your knowledge base or reminders.")) {
        chatMessages.innerHTML = '';
        chatHistory = [];
        localStorage.removeItem('atlasChatHistory');
        addMessage('ai', "Chat cleared. How can I help you today?");
    }
}

// Show notification
function showNotification(message, type = "success") {
    const container = document.getElementById('notificationContainer');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to container
    container.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export data function (for backup)
function exportData() {
    const data = {
        knowledgeBase,
        contacts,
        reminders,
        settings,
        chatHistory,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `atlas-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification("Data exported successfully!");
}

// Import data function (for restore)
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm("Import data? This will replace your current data.")) {
                    if (data.knowledgeBase) {
                        knowledgeBase = data.knowledgeBase;
                        localStorage.setItem('atlasKnowledge', JSON.stringify(knowledgeBase));
                    }
                    
                    if (data.contacts) {
                        contacts = data.contacts;
                        localStorage.setItem('atlasContacts', JSON.stringify(contacts));
                    }
                    
                    if (data.reminders) {
                        reminders = data.reminders;
                        localStorage.setItem('atlasReminders', JSON.stringify(reminders));
                    }
                    
                    if (data.settings) {
                        settings = data.settings;
                        localStorage.setItem('atlasSettings', JSON.stringify(settings));
                        applySettings();
                    }
                    
                    if (data.chatHistory) {
                        chatHistory = data.chatHistory;
                        localStorage.setItem('atlasChatHistory', JSON.stringify(chatHistory));
                    }
                    
                    // Update UI
                    updateKnowledgeList();
                    updateRemindersList();
                    updateContactsList();
                    updateLearningProgress();
                    
                    showNotification("Data imported successfully!");
                    addMessage('ai', "I've loaded your imported data. Ready to assist!");
                }
            } catch (error) {
                showNotification("Error importing data: Invalid file format", "warning");
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Initialize sample data (for demo purposes)
function initializeSampleData() {
    if (confirm("Initialize with sample data? This will add sample conversations, reminders, and knowledge.")) {
        // Add sample knowledge
        const sampleKnowledge = [
            "You work best in the morning",
            "Coffee breaks are at 10:30 AM and 3:00 PM",
            "Important emails should be flagged with 'URGENT'",
            "You prefer video calls over phone calls for meetings",
            "'Wrap up' means prepare end-of-day summary"
        ];
        
        sampleKnowledge.forEach(knowledge => {
            addToKnowledge(knowledge, 'preference');
        });
        
        // Add sample chat history
        const sampleChats = [
            { sender: 'user', text: 'Set a reminder to call mom tomorrow at 5 PM', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { sender: 'ai', text: "I'll set a reminder for you to call your mom tomorrow at 5 PM. Is there a specific reason for the call?", timestamp: new Date(Date.now() - 86300000).toISOString() },
            { sender: 'user', text: 'Send WhatsApp to John: Meeting rescheduled to 4 PM', timestamp: new Date(Date.now() - 43200000).toISOString() },
            { sender: 'ai', text: "Message prepared for John: 'Meeting rescheduled to 4 PM'. Ready to send?", timestamp: new Date(Date.now() - 43100000).toISOString() }
        ];
        
        sampleChats.forEach(chat => {
            chatHistory.push(chat);
            displayMessage(chat.sender, chat.text, chat.timestamp);
        });
        
        localStorage.setItem('atlasChatHistory', JSON.stringify(chatHistory));
        
        showNotification("Sample data initialized!");
        addMessage('ai', "I've loaded sample data. Now I know more about your preferences and routines!");
    }
}

// Add export/import buttons to UI (optional)
function addDataManagementButtons() {
    // Create a hidden div for data management
    const dataManagementDiv = document.createElement('div');
    dataManagementDiv.style.position = 'fixed';
    dataManagementDiv.style.bottom = '60px';
    dataManagementDiv.style.right = '20px';
    dataManagementDiv.style.zIndex = '999';
    dataManagementDiv.innerHTML = `
        <button onclick="exportData()" style="background: var(--secondary); color: white; border: none; padding: 8px 12px; border-radius: 8px; margin: 4px; font-size: 12px;">
            <i class="fas fa-download"></i> Export
        </button>
        <button onclick="importData()" style="background: var(--primary); color: white; border: none; padding: 8px 12px; border-radius: 8px; margin: 4px; font-size: 12px;">
            <i class="fas fa-upload"></i> Import
        </button>
        <button onclick="initializeSampleData()" style="background: var(--accent); color: white; border: none; padding: 8px 12px; border-radius: 8px; margin: 4px; font-size: 12px;">
            <i class="fas fa-vial"></i> Sample Data
        </button>
    `;
    
    document.body.appendChild(dataManagementDiv);
}

// Initialize data management buttons (uncomment to enable)
// addDataManagementButtons();
