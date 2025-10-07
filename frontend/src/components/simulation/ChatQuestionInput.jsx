import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { chatbotAPI } from '@/services/api';
import toast from 'react-hot-toast';

const ChatQuestionInput = ({ caseId, onAnswer }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await chatbotAPI.query({
        query: question,
        mode: 'case_specific',
        case_id: caseId,
      });

      onAnswer(response.data.response);
      setQuestion('');
      toast.success('Answer received!');
    } catch (error) {
      console.error('Error getting answer:', error);
      toast.error('Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about this case..."
        disabled={loading}
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !question.trim()}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
};

export default ChatQuestionInput;
