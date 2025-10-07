import { useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for copying text to clipboard
 * @returns {Array} [copiedText, copy]
 */
export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState(null);

  const copy = async (text) => {
    if (!navigator?.clipboard) {
      toast.error('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success('Copied to clipboard');
      return true;
    } catch (error) {
      toast.error('Failed to copy');
      setCopiedText(null);
      return false;
    }
  };

  return [copiedText, copy];
}