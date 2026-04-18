import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useQuestion } from '../../hooks/useQuestion';
import { useSound } from '../../hooks/useSound';
import styles from './QuestionScreen.module.css';

const GRADE_DURATION = 900;

const LEVEL_LABELS = {
  level1: 'ジャンル１',
  level2: 'ジャンル２',
  level3: 'ジャンル３',
  level4: 'ジャンル４',
  level5: 'ジャンル５',
  mixedEasy: 'ミックス（かんたん）',
  mixed: 'ミックス（ぜんぶ）',
};

function PointsBar({ points }) {
  const pct = (points / 1000) * 100;
  return (
    <div className={styles.pointsBarWrap}>
      <div className={styles.pointsRow}>
        <span>ポイント</span>
        <span className={styles.pointsValue}>{points} / 1000</span>
      </div>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuestionDisplay({ slots, blankTarget, inputValue }) {
  const { a, op, b, result } = slots;

  function renderSlot(slot, isBlank) {
    if (isBlank) {
      const hasInput = inputValue !== '';
      return (
        <div className={`${styles.blankBox} ${hasInput ? styles.filled : ''}`}>
          {hasInput ? inputValue : '□'}
        </div>
      );
    }
    return <div className={styles.numBox}>{slot}</div>;
  }

  return (
    <div className={styles.equation}>
      {renderSlot(a, blankTarget === 'a')}
      <div className={styles.opBox}>{op}</div>
      {renderSlot(b, blankTarget === 'b')}
      <div className={styles.equalsBox}>=</div>
      {renderSlot(result, blankTarget === 'result')}
    </div>
  );
}

function NumberPad({ onDigit, onBack, onSubmit, disabled }) {
  const keys = [7, 8, 9, 4, 5, 6, 1, 2, 3];
  return (
    <div className={styles.numpad}>
      {keys.map(k => (
        <button
          key={k}
          className={styles.numKey}
          onClick={() => onDigit(String(k))}
          disabled={disabled}
        >
          {k}
        </button>
      ))}
      <button className={`${styles.numKey} ${styles.backKey}`} onClick={onBack} disabled={disabled}>
        ⌫
      </button>
      <button className={styles.numKey} onClick={() => onDigit('0')} disabled={disabled}>
        0
      </button>
      <button
        className={`${styles.numKey} ${styles.submitKey}`}
        onClick={onSubmit}
        disabled={disabled}
      >
        こたえる
      </button>
    </div>
  );
}

export default function QuestionScreen() {
  const { state, dispatch } = useApp();
  const { question, nextQuestion } = useQuestion(state.courseMode);
  const { playCorrect, playWrong } = useSound();
  const activeUser = state.users.find(u => u.id === state.activeUserId);

  const [inputValue, setInputValue] = useState('');
  const [gradeState, setGradeState] = useState(null); // null | 'correct' | 'wrong'
  const timerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleDigit(d) {
    if (gradeState) return;
    setInputValue(prev => {
      if (prev.length >= 2) return prev;
      const next = prev + d;
      // Remove leading zeros
      return String(parseInt(next, 10));
    });
  }

  function handleBack() {
    if (gradeState) return;
    setInputValue(prev => prev.slice(0, -1));
  }

  function handleSubmit() {
    if (gradeState || inputValue === '') return;
    const userAnswer = parseInt(inputValue, 10);
    const isCorrect = userAnswer === question.correctAnswer;

    if (isCorrect) {
      playCorrect();
      setGradeState('correct');
      dispatch({ type: 'AWARD_POINT' });
    } else {
      playWrong();
      setGradeState('wrong');
    }

    timerRef.current = setTimeout(() => {
      setGradeState(null);
      setInputValue('');
      nextQuestion();
    }, GRADE_DURATION);
  }

  const badgeClass = styles[`badge-${state.courseMode}`] || '';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.homeBtn} onClick={() => dispatch({ type: 'RETURN_HOME' })}>
          ← ホーム
        </button>
        <span className={`${styles.levelBadge} ${badgeClass}`}>
          {LEVEL_LABELS[state.courseMode]}
        </span>
        <span style={{ width: 70 }} />
      </div>

      {activeUser && <PointsBar points={activeUser.points} />}

      <div className={styles.main}>
        <QuestionDisplay
          slots={question.slots}
          blankTarget={question.blankTarget}
          inputValue={inputValue}
        />
        <NumberPad
          onDigit={handleDigit}
          onBack={handleBack}
          onSubmit={handleSubmit}
          disabled={!!gradeState}
        />
      </div>

      {gradeState && (
        <div className={styles.gradeOverlay}>
          <span className={`${styles.gradeMark} ${gradeState === 'correct' ? styles.correct : styles.wrong}`}>
            {gradeState === 'correct' ? '○' : '✕'}
          </span>
          {gradeState === 'wrong' && (
            <div className={styles.wrongAnswer}>
              こたえ: {question.correctAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
