import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowDownUp,
  Settings,
  Wallet,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";
import { Token, ToastMessage } from "../types";
import TokenModal from "./TokenModal";
import TokenIcon from "./TokenIcon";
import { fetchPrices } from "../services/priceService";

interface SwapCardProps {
  addToast: (msg: Omit<ToastMessage, "id">) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const SwapCard: React.FC<SwapCardProps> = ({
  addToast,
  theme,
  toggleTheme,
}) => {
  // Data State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");

  // UI State
  const [isFromModalOpen, setIsFromModalOpen] = useState(false);
  const [isToModalOpen, setIsToModalOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPrices();
        setTokens(data);
        // Defaults
        const eth = data.find((t) => t.symbol === "ETH");
        const usdc = data.find((t) => t.symbol === "USDC");
        if (eth) setFromToken(eth);
        if (usdc) setToToken(usdc);
      } catch (e) {
        addToast({ type: "error", message: "Failed to load token prices." });
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateToAmount = useCallback(
    (amount: string, source: Token | null, target: Token | null) => {
      if (!amount || !source || !target || isNaN(parseFloat(amount))) return "";
      const val = parseFloat(amount);
      const result = (val * source.price) / target.price;
      return parseFloat(result.toFixed(8)).toString();
    },
    []
  );

  const calculateFromAmount = useCallback(
    (amount: string, source: Token | null, target: Token | null) => {
      if (!amount || !source || !target || isNaN(parseFloat(amount))) return "";
      const val = parseFloat(amount);
      const result = (val * target.price) / source.price;
      return parseFloat(result.toFixed(8)).toString();
    },
    []
  );

  // Handlers
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, '.');
    // Allow digits and one dot
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setFromAmount(val);
      setToAmount(calculateToAmount(val, fromToken, toToken));
    }
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, '.');
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setToAmount(val);
      setFromAmount(calculateFromAmount(val, fromToken, toToken));
    }
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromTokenSelect = (token: Token) => {
    setFromToken(token);
    setToAmount(calculateToAmount(fromAmount, token, toToken));
  };

  const handleToTokenSelect = (token: Token) => {
    setToToken(token);
    setFromAmount(calculateFromAmount(toAmount, fromToken, token));
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      addToast({
        type: "error",
        message: "Please enter a valid amount to swap.",
      });
      return;
    }

    setIsSwapping(true);

    // Simulate network delay
    setTimeout(() => {
      setIsSwapping(false);
      // Random success/fail for demonstration
      const success = Math.random() > 0.1;

      if (toToken?.symbol !== fromToken?.symbol) {
        addToast({
          type: "success",
          message: `Successfully swapped ${fromAmount} ${fromToken.symbol} to ${toAmount} ${toToken.symbol}!`,
        });
        setFromAmount("");
        setToAmount("");
      } else {
        addToast({
          type: "error",
          message: "Swap failed: Cannot swap the same token.",
        });
      }
    }, 1500);
  };

  const formatRate = (rate: number) => {
    if (rate === 0) return "0";
    // very small rate number
    if (rate < 0.0001) {
      const str = rate.toFixed(20);
      const firstNonZero = str.match(/[1-9]/);
      if (firstNonZero && firstNonZero.index) {
        return rate.toFixed(firstNonZero.index - 1);
      }
      return rate.toFixed(10);
    }
    return rate.toFixed(6).replace(/\.?0+$/, "");
  };

  const exchangeRate =
    fromToken && toToken
      ? `1 ${fromToken.symbol} = ${formatRate(
          fromToken.price / toToken.price
        )} ${toToken.symbol}`
      : "-";

  if (loading) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-200 dark:border-dark-border shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <span className="text-gray-500 dark:text-gray-400 font-medium">
          Loading Prices...
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl px-4 lg:py-4 py-2 border border-gray-200 dark:border-dark-border shadow-2xl relative transition-colors duration-300">
        <div className="flex justify-between items-center mb-4 px-2 relative">
          <h2 className="text-gray-900 dark:text-white font-semibold text-lg">
            Swap
          </h2>
          <div ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <Settings size={20} />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in-up">
                <div className="p-4">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Theme
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      {theme === "dark" ? (
                        <Moon size={16} />
                      ) : (
                        <Sun size={16} />
                      )}
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </span>
                    <button
                      onClick={toggleTheme}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        theme === "dark" ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                          theme === "dark" ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-light-input dark:bg-dark-input rounded-2xl px-4 lg:py-4 py-2 mb-2 hover:border hover:border-gray-300 dark:hover:border-gray-600 border border-transparent transition-all">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Sell
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Balance: 0.00
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              className="bg-transparent text-lg lg:text-3xl text-gray-900 dark:text-white font-semibold focus:outline-none w-full placeholder-gray-400 dark:placeholder-gray-600"
              value={fromAmount}
              onChange={handleFromAmountChange}
            />
            <button
              onClick={() => setIsFromModalOpen(true)}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full px-3 py-1.5 flex items-center gap-2 font-medium transition-colors shrink-0 shadow-sm min-w-[110px] justify-between"
            >
              {fromToken ? (
                <>
                  <div className="flex items-center gap-2">
                    <TokenIcon symbol={fromToken.symbol} className="w-5 h-5" />
                    <span>{fromToken.symbol}</span>
                  </div>
                </>
              ) : (
                <span>Select</span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
          <div className="flex justify-between mt-2 h-5">
            <span className="text-gray-400 dark:text-gray-500 text-xs">
              {fromToken && fromAmount
                ? `$${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}`
                : ""}
            </span>
          </div>
        </div>

        <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleFlip}
            className="bg-white dark:bg-dark-card border-4 border-light-bg dark:border-dark-bg text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary rounded-xl p-2 shadow-sm dark:shadow-xl hover:scale-110 transition-transform"
          >
            <ArrowDownUp size={18} />
          </button>
        </div>

        <div className="bg-light-input dark:bg-dark-input rounded-2xl px-4 lg:py-4 py-2 mt-2 mb-4 hover:border hover:border-gray-300 dark:hover:border-gray-600 border border-transparent transition-all">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Buy
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Balance: 0.00
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              className="bg-transparent text-xl lg:text-3xl text-gray-900 dark:text-white font-semibold focus:outline-none w-full placeholder-gray-400 dark:placeholder-gray-600"
              value={toAmount}
              onChange={handleToAmountChange}
            />
            <button
              onClick={() => setIsToModalOpen(true)}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full px-3 py-1.5 flex items-center gap-2 font-medium transition-colors shrink-0 shadow-sm min-w-[110px] justify-between"
            >
              {toToken ? (
                <>
                  <div className="flex items-center gap-2">
                    <TokenIcon symbol={toToken.symbol} className="w-5 h-5" />
                    <span>{toToken.symbol}</span>
                  </div>
                </>
              ) : (
                <span>Select</span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
          <div className="flex justify-between mt-2 h-5">
            <span className="text-gray-400 dark:text-gray-500 text-xs">
              {toToken && toAmount
                ? `$${(parseFloat(toAmount) * toToken.price).toFixed(2)}`
                : ""}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center px-2 mb-4 text-xs font-medium text-gray-500 dark:text-gray-400">
          <span>Rate</span>
          <span className="text-gray-900 dark:text-white">{exchangeRate}</span>
        </div>

        <button
          onClick={handleSwap}
          disabled={!fromToken || !toToken || !fromAmount || isSwapping}
          className={`w-full py-2 lg:py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-md ${
            !fromToken || !toToken || !fromAmount
              ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : isSwapping
              ? "bg-primary/80 text-black cursor-wait"
              : "bg-primary hover:bg-primary-hover text-black hover:shadow-primary/25 hover:-translate-y-0.5"
          }`}
        >
          {isSwapping ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Swapping...</span>
            </div>
          ) : !fromToken || !toToken ? (
            "Select Token"
          ) : !fromAmount ? (
            "Enter Amount"
          ) : (
            "Swap"
          )}
        </button>

        <div className="mt-4 flex justify-center">
          <button className="flex items-center gap-2 text-primary hover:text-primary-hover text-sm font-semibold transition-colors">
            <Wallet size={16} /> Connect Wallet
          </button>
        </div>
      </div>

      <TokenModal
        isOpen={isFromModalOpen}
        onClose={() => setIsFromModalOpen(false)}
        tokens={tokens}
        onSelect={handleFromTokenSelect}
      />
      <TokenModal
        isOpen={isToModalOpen}
        onClose={() => setIsToModalOpen(false)}
        tokens={tokens}
        onSelect={handleToTokenSelect}
      />
    </>
  );
};

export default SwapCard;
