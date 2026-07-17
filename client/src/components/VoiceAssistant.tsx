import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, Loader2, CheckCircle, XCircle, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'

// Audio Visualizer Component
function AudioVisualizer({ isListening }: { isListening: boolean }) {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0))
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isListening) {
      setBars(Array(20).fill(0))
      return
    }

    const animate = () => {
      setBars(prev => prev.map(() => Math.random() * 100))
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening])

  return (
    <div className="flex items-center justify-center gap-1 h-12 w-full">
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 bg-red-500 rounded-full"
          animate={{
            height: isListening ? `${height}%` : '10%',
          }}
          transition={{
            duration: 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

// Declare Gemini API types
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

interface VoiceAssistantProps {
  onAddPayment: (playerId: string, amount: number) => Promise<void>
  onDeletePayment: (paymentId: string) => Promise<void>
  onDeletePlayer: (playerId: string) => Promise<void>
  onDeleteInstallment: (playerId: string, installmentNumber?: number) => Promise<void>
  onAddPlayer: (playerData: { name: string; father_name: string; address: string; email: string }) => Promise<void>
  onLogout: () => Promise<void>
  onNavigate: (page: string) => void
  players?: Array<{ id: string; name: string; player_code: string }>
}

type Status = 'idle' | 'listening' | 'processing' | 'speaking' | 'success' | 'error'

export default function VoiceAssistant({ onAddPayment, onDeletePayment, onDeletePlayer, onDeleteInstallment, onAddPlayer, onLogout, onNavigate, players = [] }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [groqApiKey, setGroqApiKey] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [pendingAction, setPendingAction] = useState<{ type: string; data: any } | null>(null)
  const [addPlayerMode, setAddPlayerMode] = useState(false)
  const [playerData, setPlayerData] = useState({
    name: '',
    father_name: '',
    address: '',
    email: ''
  })
  const [addPlayerStep, setAddPlayerStep] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const hasShownRateLimitWarning = useRef(false)
  
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const savedKey = localStorage.getItem('groq_api_key')
    if (savedKey) setGroqApiKey(savedKey)
  }, [])

  const saveApiKey = () => {
    localStorage.setItem('groq_api_key', groqApiKey)
    setShowConfig(false)
    speak('API key saved successfully')
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 0.8
      utterance.volume = 1.5
      
      const voices = window.speechSynthesis.getVoices()
      const maleVoice = voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('David') || 
        voice.name.includes('James') ||
        voice.name.includes('Daniel') ||
        voice.name.includes('Google UK English Male') ||
        voice.name.includes('Microsoft David') ||
        voice.name.includes('Microsoft Mark')
      )
      
      if (maleVoice) {
        utterance.voice = maleVoice
      }
      
      synthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setStatus('speaking')
      setTimeout(() => setStatus('idle'), text.length * 50)
    }
  }

  const startListening = () => {
    if (!groqApiKey) {
      setShowConfig(true)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setStatus('listening')
      setTranscript('')
      setResponse('')
      hasShownRateLimitWarning.current = false
    }

    recognition.onresult = async (event: any) => {
      console.log('🎤 Speech recognition results:', event.results)
      
      const latestResult = event.results[event.results.length - 1]
      const transcript = latestResult[0].transcript
      const isFinal = latestResult.isFinal
      
      console.log('💬 Transcript:', transcript)
      console.log('✅ Is final:', isFinal)
      
      setTranscript(transcript)
      
      if (silenceTimer) {
        clearTimeout(silenceTimer)
      }
      
      const timer = setTimeout(() => {
        if (isListening) {
          console.log('⏱️ 5 seconds of silence detected, stopping microphone')
          stopListening()
          speak('Microphone turned off due to silence.')
        }
      }, 5000)
      
      setSilenceTimer(timer)
      
      if (isFinal) {
        setStatus('processing')
        
        if (silenceTimer) {
          clearTimeout(silenceTimer)
        }
        
        try {
          const result = await processWithGroq(transcript)
          setResponse(result.message)
          await executeAction(result.action, result.data, transcript)
          setStatus('success')
          speak(result.message)
        } catch (error) {
          const errorMsg = 'Sorry, I encountered an error. Please try again.'
          setResponse(errorMsg)
          setStatus('error')
          speak(errorMsg)
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        setSilenceTimer(null)
      }
      
      if (event.error === 'no-speech') {
        setStatus('idle')
        setResponse('')
        speak('Please give me order')
      } else {
        setStatus('error')
        setResponse(`Error: ${event.error}`)
        speak('Sorry, I did not catch that. Please try again.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        setSilenceTimer(null)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      setStatus('idle')
      
      if (silenceTimer) {
        clearTimeout(silenceTimer)
        setSilenceTimer(null)
      }
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return
    
    if (!groqApiKey) {
      setShowConfig(true)
      return
    }

    const input = textInput.trim()
    setTextInput('')
    setTranscript(input)
    setStatus('processing')
    
    try {
      const result = await processWithGroq(input)
      setResponse(result.message)
      await executeAction(result.action, result.data, input)
      setStatus('success')
      speak(result.message)
    } catch (error) {
      const errorMsg = 'Sorry, I encountered an error. Please try again.'
      setResponse(errorMsg)
      setStatus('error')
      speak(errorMsg)
    }
  }

  const processWithGroq = async (transcript: string): Promise<{ action: string; data: any; message: string }> => {
    const pendingContext = pendingAction ? `\n\nIMPORTANT: There is a pending delete action for ${pendingAction.data.playerName || 'a player'}. If the user says "yes", "yeah", "yep", "confirm", "sure", "ok", "okay" → return { "action": "confirm_delete", "data": { "confirm": "yes" }, "message": "Confirming..." }. If user says "no", "cancel", "stop" → return { "action": "cancel", "data": {}, "message": "Cancelling..." }` : ''
    
    const addPlayerContext = addPlayerMode ? `\n\nCRITICAL WORKFLOW - ADD PLAYER MODE ACTIVE:
You are currently in "Add Player Data Entry Mode" at Step ${addPlayerStep}. You MUST collect all 4 fields sequentially without stopping.
Current data collected: ${JSON.stringify(playerData)}

STRICT RULES:
1. You are currently at Step ${addPlayerStep}. Wait for the user to provide ONLY the current field.
2. After user provides the field, IMMEDIATELY acknowledge it and ask for the NEXT field in sequence.
3. Do NOT skip steps. Do NOT ask for multiple fields at once. Do NOT stop until all 4 fields are collected.
4. The sequence is ALWAYS: Name (Step 1) → Father's Name (Step 2) → Address (Step 3) → Email (Step 4) → Complete

LANGUAGE DETECTION (CRITICAL):
- ALWAYS detect the user's language from their input
- If user speaks in ENGLISH, respond in ENGLISH
- If user speaks in URDU, respond in URDU
- Match the user's language exactly

ENGLISH RESPONSES:
- If at Step 1 and user says "John Smith" → { "action": "add_player_data", "data": { "field": "name", "value": "John Smith" }, "message": "Got it. Now, what is the player's father's name?" }
- If at Step 2 and user says "Robert Smith" → { "action": "add_player_data", "data": { "field": "father_name", "value": "Robert Smith" }, "message": "Perfect. What is the player's address?" }
- If at Step 3 and user says "123 Main Street" → { "action": "add_player_data", "data": { "field": "address", "value": "123 Main Street" }, "message": "Great. What is the player's email address? Or say skip if not available." }
- If at Step 4 and user says "john@example.com" or "skip" → { "action": "add_player_data", "data": { "field": "email", "value": "john@example.com" }, "message": "Excellent. Let me add the player to the database now." }

URDU RESPONSES (Roman Urdu or Urdu script):
- If at Step 1 and user says "Ali Ahmed" or "علی احمد" → { "action": "add_player_data", "data": { "field": "name", "value": "Ali Ahmed" }, "message": "ٹھیک ہے۔ اب کھلاڑی کے والد کا نام بتائیں۔" }
- If at Step 2 and user says "Ahmed Khan" or "احمد خان" → { "action": "add_player_data", "data": { "field": "father_name", "value": "Ahmed Khan" }, "message": "بہترین۔ کھلاڑی کا پتہ بتائیں۔" }
- If at Step 3 and user says "123 Main Street" or "مرکزی سڑک 123" → { "action": "add_player_data", "data": { "field": "address", "value": "123 Main Street" }, "message": "اچھا۔ کھلاڑی کا ای میل ایڈریس بتائیں، یا دستیاب نہ ہونے پر skip کہیں۔" }
- If at Step 4 and user says "ali@example.com" or "skip" → { "action": "add_player_data", "data": { "field": "email", "value": "ali@example.com" }, "message": "بہت خوب۔ میں اب ڈیٹا بیس میں کھلاڑی شامل کر رہا ہوں۔" }

If user says "cancel" or "stop" or "منسوخ" during data entry → { "action": "cancel_add_player", "data": {}, "message": "Add player cancelled" }` : ''
    
    const systemPrompt = `You are a bilingual voice and text assistant for Star Badminton Club management system. 
You can understand and speak both English and Urdu languages.

Analyze the user's command (voice or text) and respond with a JSON object containing:
- action: one of ['add_payment', 'delete_payment', 'delete_player', 'delete_installment', 'logout', 'navigate', 'confirm_delete', 'cancel', 'add_player_workflow', 'add_player_data', 'cancel_add_player', 'unknown', 'greeting', 'identity', 'inventory_check', 'payment_inquiry', 'pdf_export']
- data: relevant data for the action
- message: a friendly confirmation message (in the SAME language as user's input)

Available players:
${players.map(p => `- ${p.name} (${p.player_code})`).join('\n')}

Available pages: dashboard, players, payments, investments, shuttle, records${pendingContext}${addPlayerContext}

CRITICAL RULES:
1. When user says "yes", "yeah", "yep", "confirm", "sure", "ok", "okay" in response to a delete confirmation → { "action": "confirm_delete", "data": { "confirm": "yes" }, "message": "Confirming delete..." }
2. When user says "no", "nope", "cancel", "stop", "don't" in response to a delete confirmation → { "action": "cancel", "data": {}, "message": "Cancelling..." }

LANGUAGE DETECTION (MOST CRITICAL):
- ALWAYS detect the user's language from their input
- If user speaks in ENGLISH, respond in ENGLISH
- If user speaks in URDU (Roman or Urdu script), respond in URDU
- Match the user's language exactly throughout the conversation

IDENTITY & GREETING:
3. When user asks "Who are you?" or "کون ہو تم" or "Who is this?" → { "action": "identity", "data": {}, "message": "I am the Star Badminton Club chatbot, developed to make your club management easier and more efficient." }
4. When user says "hello", "hi", "hey", "assalamu alaykum", "سلام" → { "action": "greeting", "data": {}, "message": "As-salamu alaykum. How can I assist you today?" }

INVENTORY CHECKS:
5. When user asks about shuttles/stock (e.g., "How many shuttles are left?", "شٹلز کتنے باقی ہیں") → { "action": "inventory_check", "data": { "item": "shuttles" }, "message": "You have [X] shuttles remaining." }

PAYMENT INQUIRIES:
6. When user asks about payments (e.g., "How much has Ali paid?", "علی نے کتنا ادایگی کی ہے") → { "action": "payment_inquiry", "data": { "player_name": "Ali" }, "message": "Ali has paid a total of [X] rupees." }

PDF EXPORT:
7. When user says "export PDF", "generate PDF", "PDF export" → { "action": "pdf_export", "data": {}, "message": "Would you like to export the Player Records PDF or the Investments PDF?" }

ADD PLAYER WORKFLOW:
8. When user says "add player", "add new player", "turn on add player option", "create player", "کھلاڑی شامل کریں" → { "action": "add_player_workflow", "data": {}, "message": "Starting add player workflow. Let's begin. What is the player's full name?" }
9. CRITICAL: During add player mode, you MUST follow the sequential workflow strictly. After each field, immediately ask for the next field in the SAME language as the user.

Rules:
1. For "add payment" commands:
   - Extract player name and amount
   - Match player name to available players
   - Example: "Add payment for Ahmad 600" → { "action": "add_payment", "data": { "player_name": "Ahmad", "amount": 600 }, "message": "Payment added successfully for Ahmad" }

2. For "delete payment" commands:
   - Extract payment ID or description
   - Example: "Delete payment 123" → { "action": "delete_payment", "data": { "payment_id": "123" }, "message": "Payment deleted successfully" }

3. For "delete player" commands:
   - Extract player name
   - Match player name to available players
   - Example: "Delete player Ahmad" → { "action": "delete_player", "data": { "player_name": "Ahmad" }, "message": "Are you sure you want to delete Ahmad? Please say yes or no to confirm." }

4. For "delete installment" commands:
   - Extract player name and installment number (if specified)
   - Match player name to available players
   - Example: "Delete installment 1 for Ahmad" → { "action": "delete_installment", "data": { "player_name": "Ahmad", "installment": 1 }, "message": "Are you sure you want to delete installment 1 for Ahmad? Please say yes or no to confirm." }
   - Example: "Delete all installments for Ahmad" → { "action": "delete_installment", "data": { "player_name": "Ahmad", "installment": "all" }, "message": "Are you sure you want to delete all installments for Ahmad? Please say yes or no to confirm." }

5. For "confirm delete" commands (when user responds to confirmation):
   - User might say: "yes", "yeah", "yep", "confirm", "sure", "ok", "okay" → { "action": "confirm_delete", "data": { "confirm": "yes" }, "message": "Confirming delete..." }
   - User might say: "no", "nope", "cancel", "stop", "don't" → { "action": "cancel", "data": {}, "message": "Cancelling..." }

6. For "logout" commands:
   - Example: "Logout" → { "action": "logout", "data": {}, "message": "Logged out successfully" }

7. For "navigate" commands:
   - Extract page name from command
   - Example: "Open records" → { "action": "navigate", "data": { "page": "records" }, "message": "Opening your records page. Here is your dashboard records." }
   - Example: "Go to dashboard" → { "action": "navigate", "data": { "page": "dashboard" }, "message": "Navigating to dashboard" }
   - Example: "Show payments" → { "action": "navigate", "data": { "page": "payments" }, "message": "Opening payments page" }

8. For unknown commands:
   - Example: "What's the weather" → { "action": "unknown", "data": {}, "message": "I can help you with adding players, adding payments, deleting payments, deleting players, navigating pages, or logging out" }

Respond ONLY with valid JSON, no additional text.`

    if (!groqApiKey || groqApiKey.length < 10) {
      throw new Error('Please configure your Groq API key in Settings')
    }

    console.log('🤖 Calling Groq API with model: llama-3.3-70b-versatile')
    
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions'
    
    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `${transcript}\n\nRespond with JSON only:`
        }
      ],
      temperature: 0.1,
      max_tokens: 200
    }
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 Groq API response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      console.error('❌ Groq API error:', response.status, errorData)
      
      if (response.status === 401) {
        throw new Error('Invalid Groq API key. Please check your key at https://console.groq.com/keys')
      } else if (response.status === 429) {
        console.warn('⚠️ Rate limit hit, retry count:', retryCount)
        
        // Only show warning once using ref (synchronous, no re-render needed)
        if (!hasShownRateLimitWarning.current) {
          hasShownRateLimitWarning.current = true
          toast.loading('Rate limit reached. Retrying automatically...', { duration: 2000 })
          speak('Please wait, retrying in a moment.')
        }
        
        if (retryCount < 3) {
          const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 8000)
          setRetryCount(prev => prev + 1)
          setIsRetrying(true)
          
          // Wait without showing additional messages
          await new Promise(resolve => setTimeout(resolve, backoffTime))
          setIsRetrying(false)
          
          // Retry the request
          return processWithGroq(transcript)
        } else {
          // Max retries reached - show clear error
          hasShownRateLimitWarning.current = false // Reset for next session
          throw new Error('Rate limit exceeded. Please wait 1-2 minutes before trying again. The free tier has usage limits.')
        }
      } else if (response.status === 400) {
        const errorMsg = errorData.error?.message || 'Bad request'
        console.error('❌ 400 Error details:', errorMsg)
        throw new Error(`Invalid request: ${errorMsg}. Please check your API key and try again.`)
      } else {
        throw new Error(`Groq API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`)
      }
    }

    const data = await response.json()
    console.log('📦 Groq API response:', data)
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response format from Groq AI')
    }
    
    const text = data.choices[0].message.content
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI returned invalid format. Please try again.')
    }

    return JSON.parse(jsonMatch[0])
  }

  const executeAction = async (action: string, data: any, currentTranscript?: string): Promise<void> => {
    console.log('⚡ Executing action:', action, data)
    console.log('📋 Pending action:', pendingAction)
    console.log('💬 Current transcript:', currentTranscript)
    
    setRetryCount(0)
    
    try {
      if (pendingAction && currentTranscript && !isRetrying) {
        const transcriptLower = currentTranscript.toLowerCase().trim()
        const confirmationWords = ['yes', 'yeah', 'yep', 'confirm', 'sure', 'ok', 'okay', 'yup', 'ya', 'do it', 'delete it']
        const cancelWords = ['no', 'nope', 'cancel', 'stop', 'don\'t', 'dont']
        
        const isYes = confirmationWords.some(word => transcriptLower.includes(word))
        const isNo = cancelWords.some(word => transcriptLower.includes(word))
        
        console.log('🔍 Checking confirmation:', { transcriptLower, isYes, isNo })
        
        if (isYes && !isNo) {
          console.log('✅ Direct confirmation detected from transcript')
          if (pendingAction.type === 'delete_player') {
            await onDeletePlayer(pendingAction.data.playerId)
            toast.success(`Player ${pendingAction.data.playerName} deleted successfully`)
            setPendingAction(null)
            return
          } else if (pendingAction.type === 'delete_installment') {
            await onDeleteInstallment(pendingAction.data.playerId, pendingAction.data.installment)
            const installmentText = pendingAction.data.installment === 'all' ? 'all installments' : `installment ${pendingAction.data.installment}`
            toast.success(`${installmentText} deleted for ${pendingAction.data.playerName}`)
            setPendingAction(null)
            return
          }
        } else if (isNo && !isYes) {
          console.log('❌ Direct cancel detected from transcript')
          toast.success('Delete cancelled')
          setPendingAction(null)
          return
        }
      }

      switch (action) {
        case 'add_payment':
          const player = players.find(p => 
            p.name.toLowerCase().includes(data.player_name.toLowerCase())
          )
          if (!player) {
            const errorMsg = 'Player not found. Please try again.'
            toast.error(errorMsg)
            throw new Error(errorMsg)
          }
          await onAddPayment(player.id, data.amount)
          toast.success(`Payment added successfully for ${player.name}`)
          break

        case 'delete_payment':
          if (confirm(`Are you sure you want to delete payment ${data.payment_id}?`)) {
            await onDeletePayment(data.payment_id)
            toast.success('Payment deleted successfully')
          }
          break

        case 'delete_player':
          const playerToDelete = players.find(p => 
            p.name.toLowerCase().includes(data.player_name.toLowerCase())
          )
          if (!playerToDelete) {
            const errorMsg = 'Player not found. Please try again.'
            toast.error(errorMsg)
            throw new Error(errorMsg)
          }
          setPendingAction({
            type: 'delete_player',
            data: { playerId: playerToDelete.id, playerName: playerToDelete.name }
          })
          toast.loading(`Are you sure you want to delete ${playerToDelete.name}? Say "yes" to confirm or "no" to cancel.`, { duration: 5000 })
          break

        case 'delete_installment':
          const playerForInstallment = players.find(p => 
            p.name.toLowerCase().includes(data.player_name.toLowerCase())
          )
          if (!playerForInstallment) {
            const errorMsg = 'Player not found. Please try again.'
            toast.error(errorMsg)
            throw new Error(errorMsg)
          }
          setPendingAction({
            type: 'delete_installment',
            data: { 
              playerId: playerForInstallment.id, 
              playerName: playerForInstallment.name,
              installment: data.installment
            }
          })
          const installmentText = data.installment === 'all' ? 'all installments' : `installment ${data.installment}`
          toast.loading(`Are you sure you want to delete ${installmentText} for ${playerForInstallment.name}? Say "yes" to confirm or "no" to cancel.`, { duration: 5000 })
          break

        case 'confirm_delete':
          if (!pendingAction) {
            toast.error('No pending delete action. Please try again.')
            break
          }
          
          if (data.confirm === 'yes' || data.confirm === true) {
            if (pendingAction.type === 'delete_player') {
              await onDeletePlayer(pendingAction.data.playerId)
              toast.success(`Player ${pendingAction.data.playerName} deleted successfully`)
            } else if (pendingAction.type === 'delete_installment') {
              await onDeleteInstallment(pendingAction.data.playerId, pendingAction.data.installment)
              const installmentText = pendingAction.data.installment === 'all' ? 'all installments' : `installment ${pendingAction.data.installment}`
              toast.success(`${installmentText} deleted for ${pendingAction.data.playerName}`)
            }
            setPendingAction(null)
          } else {
            toast.success('Delete cancelled')
            setPendingAction(null)
          }
          break

        case 'cancel':
          toast.success('Action cancelled')
          setPendingAction(null)
          break

        case 'logout':
          await onLogout()
          toast.success('Logged out successfully')
          break

        case 'navigate':
          console.log('🧭 Navigating to:', data.page)
          onNavigate(data.page)
          toast.success(`Opening ${data.page} page`)
          break

        case 'add_player_workflow':
          setAddPlayerMode(true)
          setAddPlayerStep(1)
          setPlayerData({ name: '', father_name: '', address: '', email: '' })
          speak('Starting add player workflow. Let\'s begin. What is the player\'s full name?')
          toast.loading('Add Player Mode: Please provide the player\'s name.', { duration: 5000 })
          break

        case 'add_player_data':
          if (!addPlayerMode) {
            toast.error('Not in add player mode. Please say "add player" to start.')
            break
          }

          const newPlayerData = { ...playerData, [data.field]: data.value }
          setPlayerData(newPlayerData)
          
          if (data.field === 'name') {
            setAddPlayerStep(2)
            speak('Got it. What is the player\'s father\'s name?')
            toast.loading('Step 2: Father\'s name', { duration: 5000 })
          } else if (data.field === 'father_name') {
            setAddPlayerStep(3)
            speak('Perfect. What is the player\'s address?')
            toast.loading('Step 3: Address', { duration: 5000 })
          } else if (data.field === 'address') {
            setAddPlayerStep(4)
            speak('Great. What is the player\'s email address? Or say skip if not available.')
            toast.loading('Step 4: Email (optional)', { duration: 5000 })
          } else if (data.field === 'email') {
            setAddPlayerMode(false)
            setAddPlayerStep(0)
            try {
              await onAddPlayer(newPlayerData)
              speak('Excellent. Player has been successfully added to the database.')
              toast.success('Player added successfully!')
            } catch (error) {
              speak('Sorry, there was an error adding the player. Please try again.')
              toast.error('Failed to add player')
            }
          }
          break

        case 'cancel_add_player':
          setAddPlayerMode(false)
          setAddPlayerStep(0)
          setPlayerData({ name: '', father_name: '', address: '', email: '' })
          speak('Add player cancelled.')
          toast.success('Add player mode cancelled')
          break

        default:
          if (pendingAction) {
            console.warn('⚠️ Unknown action with pending action - waiting for confirmation')
          } else {
            throw new Error('Unknown action')
          }
      }
    } catch (error: any) {
      console.error('❌ Action execution error:', error)
      setPendingAction(null)
      throw error
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'listening':
        return <Mic className="w-5 h-5 text-white" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-white animate-spin" />
      case 'speaking':
        return <Volume2 className="w-5 h-5 text-white" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />
      case 'error':
        return <XCircle className="w-5 h-5 text-white" />
      default:
        return isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening...'
      case 'processing':
        return 'Processing...'
      case 'speaking':
        return 'Speaking...'
      case 'success':
        return 'Done!'
      case 'error':
        return 'Error'
      default:
        return 'Click to speak'
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Configure Groq API
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get your free API key from{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Groq Console
              </a>
            </p>
            <input
              type="text"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              placeholder="Enter your Groq API key"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveApiKey}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button (Minimized State) */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsExpanded(true)}
            className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-colors duration-300 ${
              status === 'listening' 
                ? 'bg-red-500 hover:bg-red-600' 
                : status === 'processing'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : status === 'speaking'
                ? 'bg-blue-500 hover:bg-blue-600'
                : status === 'success'
                ? 'bg-green-500 hover:bg-green-600'
                : status === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            {getStatusIcon()}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Interface */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 w-80"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Audio Visualizer - Shows when listening */}
            {isListening && (
              <div className="mb-4">
                <AudioVisualizer isListening={isListening} />
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                  Listening...
                </div>
              </div>
            )}

            {/* Main Voice Button */}
            <div className="relative flex items-center justify-center mb-4">
              {/* Pulsing Ring Animation for Listening */}
              <AnimatePresence>
                {status === 'listening' && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-red-500"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ 
                        scale: [1, 1.4, 1.4, 1],
                        opacity: [0.6, 0, 0, 0.6]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-red-400"
                      initial={{ scale: 1, opacity: 0.4 }}
                      animate={{ 
                        scale: [1, 1.6, 1.6, 1],
                        opacity: [0.4, 0, 0, 0.4]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Processing Spinner Ring */}
              <AnimatePresence>
                {status === 'processing' && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-yellow-400 border-t-transparent"
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.2, 1.2, 1],
                      opacity: [0, 1, 1, 0],
                      rotate: 360
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Speaking Sound Wave Animation */}
              <AnimatePresence>
                {status === 'speaking' && (
                  <>
                    {[0, 1, 2].map((index) => (
                      <motion.div
                        key={index}
                        className="absolute rounded-full bg-blue-400"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ 
                          scale: [1, 1.5 + index * 0.2],
                          opacity: [0.5, 0]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: index * 0.2,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Main Button */}
              <motion.button
                onClick={isListening ? stopListening : startListening}
                className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-colors duration-300 ${
                  status === 'listening' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : status === 'processing'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : status === 'speaking'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : status === 'success'
                    ? 'bg-green-500 hover:bg-green-600'
                    : status === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {getStatusIcon()}
              </motion.button>
            </div>

            {/* Status Bar with Animation */}
            <AnimatePresence>
              {(transcript || response || status !== 'idle') && (
                <motion.div
                  className="mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-h-64 overflow-y-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Status Indicator Bar */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'listening' ? 'bg-red-500 animate-pulse' :
                      status === 'processing' ? 'bg-yellow-500 animate-spin' :
                      status === 'speaking' ? 'bg-blue-500' :
                      status === 'success' ? 'bg-green-500' :
                      status === 'error' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {getStatusText()}
                    </div>
                  </div>

                  {/* Transcript */}
                  {transcript && (
                    <motion.div
                      className="mb-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">You said:</div>
                      <div className="text-sm text-gray-800 dark:text-white italic">"{transcript}"</div>
                    </motion.div>
                  )}

                  {/* Response */}
                  {response && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assistant:</div>
                      <div className="text-sm text-gray-800 dark:text-white">{response}</div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Text Input for Manual Commands */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                  placeholder="Type a command..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={handleTextSubmit}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Try: "Add payment for Ahmad 600" or "Open records"
              </div>
            </div>

            <button
              onClick={() => setShowConfig(true)}
              className="mt-3 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              ⚙️ Settings
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}