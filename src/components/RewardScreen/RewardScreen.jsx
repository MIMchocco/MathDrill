import { useApp } from '../../context/AppContext';
import { ANIMALS } from '../../logic/animals';
import styles from './RewardScreen.module.css';

// Predefined positions for up to 6 particles (avoiding center)
const PARTICLE_POSITIONS = [
  { top: '8%',  left: '10%' },
  { top: '8%',  right: '10%' },
  { top: '40%', left: '5%' },
  { top: '40%', right: '5%' },
  { bottom: '10%', left: '12%' },
  { bottom: '10%', right: '12%' },
];

function AnimalPattern({ animal }) {
  const heroClass = styles[`hero-${animal.heroAnim}`];
  const particleClass = styles[`particle-${animal.particleAnim}`];

  return (
    <div className={styles.animalStage}>
      <span className={`${styles.hero} ${heroClass}`}>
        {animal.hero}
      </span>
      {animal.particles.slice(0, 6).map((emoji, i) => (
        <span
          key={i}
          className={`${styles.particle} ${particleClass}`}
          style={{
            ...PARTICLE_POSITIONS[i],
            animationDelay: `${i * 0.18}s`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

export default function RewardScreen() {
  const { state, dispatch } = useApp();
  const animal = ANIMALS[state.pendingRewardPatternId ?? 0];

  function handleNext() {
    dispatch({ type: 'DISMISS_REWARD' });
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <p className={styles.title}>すごい！！</p>
        <p className={styles.subtitle}>1000ポイント たっせい！</p>
        <AnimalPattern animal={animal} />
        <p className={styles.reportMsg}>ママにほうこく！<br />ごほうびをもらおう🎁</p>
        <button className={styles.nextBtn} onClick={handleNext}>
          つぎへ →
        </button>
      </div>
    </div>
  );
}
