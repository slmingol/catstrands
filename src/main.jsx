import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import pkg from '../package.json'

console.log('\n' + '='.repeat(50));
console.log(`🐱  CatStrands v${pkg.version}`);
console.log('='.repeat(50) + '\n');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
