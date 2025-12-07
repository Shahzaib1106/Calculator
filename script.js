const inputDisplay = document.getElementById('input');
const resultDisplay = document.getElementById('result');
let currentInput = '';

// helper: valid characters only (digits, operators, dot, parentheses, spaces)
function isValidExpression(expr){
  return /^[0-9+\-*/().\s]+$/.test(expr);
}

// append value with some guards
function appendValue(value){
  // prevent operator at start (except minus for negative)
  const ops = ['+','*','/','-'];
  if(currentInput === '' && (['+','*','/'].includes(value))) return;

  // prevent double operator (like 5++ or 5+-)
  const last = currentInput.slice(-1);
  if(ops.includes(last) && ops.includes(value)){
    // allow last '-' followed by digit? ignore if both operators
    return;
  }

  // prevent multiple dots in a single number
  if(value === '.'){
    // find last operator to get current number part
    const parts = currentInput.split(/[\+\-\*\/\(\)]/);
    const lastPart = parts[parts.length-1];
    if(lastPart.includes('.')) return;
    if(lastPart === '' ) { // if starting a decimal like ".5" allow "0."
      currentInput += '0';
    }
  }

  currentInput += value;
  updateInput();
}

// update input DOM
function updateInput(){
  inputDisplay.textContent = currentInput === '' ? '0' : currentInput;
}

// clear
function clearDisplay(){
  currentInput = '';
  inputDisplay.textContent = '0';
  resultDisplay.textContent = '0';
}

// backspace
function backspace(){
  if(currentInput.length>0){
    currentInput = currentInput.slice(0,-1);
    updateInput();
  }
}

// calculate result safely
function calculateResult(){
  try{
    if(currentInput.trim() === '') return;
    // basic validation
    if(!isValidExpression(currentInput)) {
      resultDisplay.textContent = 'Error';
      return;
    }
    // evaluate - using Function is safer than raw eval
    // still avoid exposing to external input in production
    // replace any leading zeros like 05 -> 5 only if safe
    const sanitized = currentInput.replace(/[^0-9+\-*/().\s]/g, '');
    const result = Function('"use strict"; return (' + sanitized + ')')();
    resultDisplay.textContent = result;
  } catch (e) {
    resultDisplay.textContent = 'Error';
  }
}

// ---------- ripple visual on button clicks ----------
document.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    // ripple
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = size + 'px';
    circle.style.left = (e.clientX - rect.left - size/2) + 'px';
    circle.style.top = (e.clientY - rect.top - size/2) + 'px';
    circle.classList.add('ripple');
    circle.style.background = window.getComputedStyle(btn).backgroundImage.includes('linear-gradient') ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
    btn.appendChild(circle);
    setTimeout(()=> circle.remove(), 500);
  });
});

// ---------- keyboard support ----------
window.addEventListener('keydown', (e)=>{
  // allow numbers, operators, Enter, Backspace, ., parentheses
  if((e.key >= '0' && e.key <= '9') || ['+','-','*','/','(',')','.'].includes(e.key)){
    appendValue(e.key);
    e.preventDefault();
    return;
  }
  if(e.key === 'Enter'){
    calculateResult();
    e.preventDefault();
    return;
  }
  if(e.key === 'Backspace'){
    backspace();
    e.preventDefault();
    return;
  }
  if(e.key.toLowerCase() === 'c'){
    // press 'c' to clear
    clearDisplay();
    e.preventDefault();
    return;
  }
});

// ---------- convenience: attach existing HTML buttons to functions ----------
/* 
  Your HTML buttons should call these functions:
  - appendValue('1') etc.
  - calculateResult()
  - clearDisplay()
  Or you can wire them programmatically if needed.
*/

// initialize
updateInput();
