import { useState, useRef } from 'react';
import { genByMode, questionKey } from '../logic/questionGenerators';

const HISTORY_SIZE = 5;

export function useQuestion(courseMode) {
  const historyRef = useRef([]);

  function generateNext() {
    let q;
    let attempts = 0;
    do {
      q = genByMode(courseMode);
      attempts++;
    } while (historyRef.current.includes(questionKey(q)) && attempts < 20);

    const key = questionKey(q);
    historyRef.current = [...historyRef.current.slice(-(HISTORY_SIZE - 1)), key];
    return q;
  }

  const [question, setQuestion] = useState(() => generateNext());

  function nextQuestion() {
    setQuestion(generateNext());
  }

  return { question, nextQuestion };
}
