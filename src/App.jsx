import { AppProvider, useApp } from './context/AppContext';
import HomeScreen from './components/HomeScreen/HomeScreen';
import QuestionScreen from './components/QuestionScreen/QuestionScreen';
import RewardScreen from './components/RewardScreen/RewardScreen';

function AppContent() {
  const { state } = useApp();

  return (
    <>
      {state.screen === 'home' && <HomeScreen />}
      {(state.screen === 'question' || state.screen === 'reward') && <QuestionScreen />}
      {state.screen === 'reward' && <RewardScreen />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
