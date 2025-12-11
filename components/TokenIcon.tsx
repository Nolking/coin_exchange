import React, { useState } from 'react';
import { Coins } from 'lucide-react';

interface TokenIconProps {
  symbol: string;
  className?: string;
}

const TokenIcon: React.FC<TokenIconProps> = ({ symbol, className = "w-6 h-6" }) => {
  const [error, setError] = useState(false);
  
  // Construct the URL for the token icon based on common Switcheo repo structure
  const iconUrl = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-700 rounded-full text-gray-300 ${className}`}>
         <Coins size={16} />
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={symbol}
      className={`${className} rounded-full`}
      onError={() => setError(true)}
    />
  );
};

export default TokenIcon;
