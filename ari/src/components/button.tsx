// src/components/Button.jsx
import React from 'react';

const Button = ({ onClick, children, type = "button", disabled = false, style = {} }) => (
  <button 
    type={type} 
    onClick={onClick} 
    disabled={disabled} 
    style={{
      padding: '8px 17px',
      backgroundColor: disabled ? '#ccc' : '#007BFF',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      ...style
    }}
  >
    {children}
  </button>
);

export default Button;
