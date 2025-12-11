import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { Token } from '../types';
import TokenIcon from './TokenIcon';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  onSelect: (token: Token) => void;
}

const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose, tokens, onSelect }) => {
  const [search, setSearch] = useState('');

  const filteredTokens = useMemo(() => {
    if (!search) return tokens;
    const lowerSearch = search.toLowerCase();
    return tokens.filter(t => t.symbol.toLowerCase().includes(lowerSearch));
  }, [tokens, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-colors duration-300">
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Token</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name"
              className="w-full bg-gray-100 dark:bg-dark-input border border-transparent dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tokens found</div>
          ) : (
            <div className="space-y-1">
              {filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors group"
                >
                  <TokenIcon symbol={token.symbol} className="w-8 h-8" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">{token.symbol}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Price: ${token.price.toFixed(4)}</span>
                  </div>
                  <div className="ml-auto text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Select
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenModal;