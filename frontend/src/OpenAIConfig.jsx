import React, { useState, useEffect } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

function OpenAIConfig({ onKeyValidated }) {
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState(null)
  const [availableModels, setAvailableModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')

  useEffect(() => {
    // Load available models
    loadModels()
    
    // Check if there's a saved API key
    const savedKey = localStorage.getItem('openai_api_key')
    if (savedKey) {
      setApiKey(savedKey)
      setValidationStatus('saved')
    }
  }, [])

  const loadModels = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/models/openai`)
      const data = await response.json()
      setAvailableModels(data.models)
      setSelectedModel(data.default)
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      alert('Veuillez entrer votre clé API OpenAI')
      return
    }

    setIsValidating(true)
    setValidationStatus(null)

    try {
      const response = await fetch(`${BACKEND_URL}/config/openai-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          openai_api_key: apiKey
        })
      })

      const data = await response.json()

      if (response.ok) {
        setValidationStatus('success')
        localStorage.setItem('openai_api_key', apiKey)
        localStorage.setItem('openai_model', selectedModel)
        if (onKeyValidated) {
          onKeyValidated(apiKey, selectedModel)
        }
      } else {
        setValidationStatus('error')
        console.error('API key validation failed:', data.detail)
      }
    } catch (error) {
      setValidationStatus('error')
      console.error('Validation error:', error)
    } finally {
      setIsValidating(false)
    }
  }

  const clearApiKey = () => {
    setApiKey('')
    setValidationStatus(null)
    localStorage.removeItem('openai_api_key')
    localStorage.removeItem('openai_model')
  }

  const useEmergentKey = () => {
    setApiKey('')
    setValidationStatus('emergent')
    localStorage.removeItem('openai_api_key')
    localStorage.setItem('openai_model', selectedModel)
    if (onKeyValidated) {
      onKeyValidated(null, selectedModel) // null means use Emergent key
    }
  }

  return (
    <div className="openai-config-panel">
      <div className="config-header">
        <h3 className="font-semibold text-lg mb-2">⚙️ Configuration ChatBot</h3>
        <p className="text-sm text-white/70 mb-4">
          Choisissez votre méthode d'intelligence artificielle
        </p>
      </div>

      {/* Option 1: Emergent Key */}
      <div className="config-option mb-4 p-4 border border-green-500/30 rounded-lg bg-green-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-green-400">🚀 Clé Universelle Emergent (Recommandée)</h4>
            <p className="text-xs text-white/70">
              Clé intégrée prête à l'emploi - Fonctionne immédiatement
            </p>
          </div>
          <button 
            onClick={useEmergentKey}
            className="btn-primary text-sm px-4 py-2"
          >
            Utiliser
          </button>
        </div>
      </div>

      {/* Option 2: Personal OpenAI Key */}
      <div className="config-option p-4 border border-gold/30 rounded-lg bg-gold/10">
        <h4 className="font-semibold text-gold mb-3">🔑 Clé OpenAI Personnelle</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Clé API OpenAI</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            />
            <p className="text-xs text-white/50 mt-1">
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
                Obtenez votre clé API ici
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Modèle</label>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={validateApiKey}
              disabled={isValidating || !apiKey.trim()}
              className="btn-primary text-sm px-4 py-2 flex-1"
            >
              {isValidating ? 'Test en cours...' : 'Tester & Sauvegarder'}
            </button>
            
            {apiKey && (
              <button
                onClick={clearApiKey}
                className="btn-secondary text-sm px-4 py-2"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {validationStatus === 'success' && (
          <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm">
            ✅ Clé API validée avec succès !
          </div>
        )}
        
        {validationStatus === 'error' && (
          <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
            ❌ Clé API invalide. Vérifiez votre clé.
          </div>
        )}
        
        {validationStatus === 'saved' && (
          <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/50 rounded text-blue-300 text-sm">
            💾 Clé sauvegardée localement
          </div>
        )}
        
        {validationStatus === 'emergent' && (
          <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm">
            🚀 Utilisation de la clé Emergent
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-white/70">
        <strong>💡 Conseil :</strong> La clé Universelle Emergent est plus simple et fonctionne immédiatement. 
        Utilisez votre propre clé OpenAI seulement si vous avez des besoins spécifiques.
      </div>
    </div>
  )
}

export default OpenAIConfig