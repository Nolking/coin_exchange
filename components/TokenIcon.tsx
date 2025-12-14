import React, { useEffect, useState } from "react";
import { Coins } from "lucide-react";

interface TokenIconProps {
  symbol: string;
  className?: string;
}

const TokenIcon: React.FC<TokenIconProps> = ({ symbol, className = "w-6 h-6" }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [symbol]);

  const iconUrl = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-700 rounded-full text-gray-300 ${className}`}>
        <Coins size={16} />
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Loading placeholder */}
      {loading && (
        <div className="absolute inset-0 rounded-full bg-gray-700 animate-pulse" />
      )}

      <img
        key={symbol}
        src={iconUrl}
        alt={symbol}
        className={`rounded-full w-full h-full ${loading ? "opacity-0" : "opacity-100"} transition-opacity`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  );
};

export default TokenIcon;
