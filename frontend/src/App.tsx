import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import AppInit from './components/common/AppInit';

export default function App() {
  return (
    <BrowserRouter>
      <AppInit>
        <AppRouter />
      </AppInit>
    </BrowserRouter>
  );
}
