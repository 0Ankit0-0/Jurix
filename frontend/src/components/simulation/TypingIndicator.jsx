import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TypingIndicator = ({ role = "Judge", thinkingText = "" }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!thinkingText) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < thinkingText.length) {
        setDisplayedText(thinkingText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        // Blink cursor after typing
        const cursorInterval = setInterval(() => {
          setCursorVisible((prev) => !prev);
        }, 500);
        setTimeout(() => clearInterval(cursorInterval), 2000); // Stop blinking after 2s
      }
    }, 50); // Typing speed

    return () => clearInterval(interval);
  }, [thinkingText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-4 py-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          <motion.div
            className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
          <motion.div
            className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.4,
            }}
          />
        </div>
        <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
          {role} is thinking...
        </span>
      </div>
      {thinkingText && (
        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
          {displayedText}
          <span className={`ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>
            |
          </span>
        </p>
      )}
    </motion.div>
  );
};

export default TypingIndicator;