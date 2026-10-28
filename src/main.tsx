import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

function montar() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

// VITE_MOCK=1: respostas falsas da API para desenvolver sem o servidor (o bloco some do build de produção)
if (import.meta.env.VITE_MOCK === '1') {
  import('./api/mock').then(m => { m.instalarMock(); montar() })
} else {
  montar()
}
