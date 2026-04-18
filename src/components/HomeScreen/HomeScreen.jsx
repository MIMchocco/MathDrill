import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import styles from './HomeScreen.module.css';
import cardStyles from './ProfileCard.module.css';

const AVATARS = ['🐼', '🐱', '🐶', '🐰', '🐧', '🐸', '🐻', '🐥', '🦊', '🐘'];

function ProfileCard({ user, selected, onSelect, onDelete }) {
  const avatarEmoji = AVATARS[user.id.charCodeAt(0) % AVATARS.length];
  return (
    <button
      className={`${cardStyles.card} ${selected ? cardStyles.selected : ''}`}
      onClick={() => onSelect(user.id)}
    >
      <span className={cardStyles.avatar}>{avatarEmoji}</span>
      <span className={cardStyles.name}>{user.name}</span>
      <span className={cardStyles.points}>{user.points}pt</span>
      <button
        className={cardStyles.deleteBtn}
        onClick={e => { e.stopPropagation(); onDelete(user.id); }}
        aria-label="削除"
      >
        ×
      </button>
    </button>
  );
}

function AddProfileModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const { state } = useApp();

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed.length > 10) return;
    const duplicate = state.users.some(
      u => u.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) return;
    onAdd(trimmed);
    onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <p className={styles.modalTitle}>なまえをいれてね</p>
        <input
          className={styles.nameInput}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          maxLength={10}
          placeholder="なまえ"
          autoFocus
        />
        <div className={styles.modalBtns}>
          <button className={styles.modalCancelBtn} onClick={onClose}>やめる</button>
          <button
            className={styles.modalConfirmBtn}
            onClick={handleAdd}
            disabled={!name.trim()}
          >
            つくる
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseSelect({ userId, onClose }) {
  const { state, dispatch } = useApp();
  const user = state.users.find(u => u.id === userId);

  function startCourse(mode) {
    dispatch({ type: 'SELECT_USER', userId });
    dispatch({ type: 'START_COURSE', courseMode: mode });
  }

  return (
    <div className={styles.courseSection}>
      <p className={styles.courseTitle}>コースをえらんでね</p>
      <p className={styles.courseUser}>{user?.name} さん</p>
      <div className={styles.courseGrid}>
        <button className={`${styles.courseBtn} ${styles.level1}`} onClick={() => startCourse('level1')}>
          <span className={styles.courseBtnEmoji}>🔟</span>
          <span>ジャンル１</span>
          <span style={{ fontSize: '11px', opacity: 0.85 }}>10のなかま</span>
        </button>
        <button className={`${styles.courseBtn} ${styles.level2}`} onClick={() => startCourse('level2')}>
          <span className={styles.courseBtnEmoji}>🔢</span>
          <span>ジャンル２</span>
          <span style={{ fontSize: '11px', opacity: 0.85 }}>たしざん・ひきざん</span>
        </button>
        <button className={`${styles.courseBtn} ${styles.level3}`} onClick={() => startCourse('level3')}>
          <span className={styles.courseBtnEmoji}>✖️</span>
          <span>ジャンル３</span>
          <span style={{ fontSize: '11px', opacity: 0.85 }}>九九</span>
        </button>
        <button className={`${styles.courseBtn} ${styles.level4}`} onClick={() => startCourse('level4')}>
          <span className={styles.courseBtnEmoji}>➕</span>
          <span>ジャンル４</span>
          <span style={{ fontSize: '11px', opacity: 0.85 }}>1けた くりあがり/さがりなし</span>
        </button>
        <button className={`${styles.courseBtn} ${styles.level5}`} onClick={() => startCourse('level5')}>
          <span className={styles.courseBtnEmoji}>🧮</span>
          <span>ジャンル５</span>
          <span style={{ fontSize: '11px', opacity: 0.85 }}>2けた くりあがり/さがりなし</span>
        </button>
        <button className={`${styles.courseBtn} ${styles.mixedEasy} ${styles.mixedBtn}`} onClick={() => startCourse('mixedEasy')}>
          <span className={styles.courseBtnEmoji}>🎯</span>
          <span>ミックス（かんたん）</span>
        </button>
        <button className={`${styles.courseBtn} ${styles.mixed} ${styles.mixedBtn}`} onClick={() => startCourse('mixed')}>
          <span className={styles.courseBtnEmoji}>🎲</span>
          <span>ミックス（ぜんぶ）</span>
        </button>
      </div>
      <button className={styles.cancelBtn} onClick={onClose}>← もどる</button>
    </div>
  );
}

export default function HomeScreen() {
  const { state, dispatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  function handleSelectUser(id) {
    setSelectedUserId(prev => prev === id ? null : id);
  }

  function handleDeleteUser(id) {
    if (selectedUserId === id) setSelectedUserId(null);
    dispatch({ type: 'DELETE_USER', userId: id });
  }

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.title}>🧮 けいさん<br />れんしゅう</h1>
        <p className={styles.titleSub}>まいにちちょっとずつ！</p>
      </div>

      {selectedUserId ? (
        <CourseSelect
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      ) : (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>だれがやる？</p>
          <div className={styles.profileGrid}>
            {state.users.map(user => (
              <ProfileCard
                key={user.id}
                user={user}
                selected={selectedUserId === user.id}
                onSelect={handleSelectUser}
                onDelete={handleDeleteUser}
              />
            ))}
            <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
              <span className={styles.addIcon}>＋</span>
              <span>あたらしく</span>
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddProfileModal
          onAdd={name => dispatch({ type: 'ADD_USER', name })}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
