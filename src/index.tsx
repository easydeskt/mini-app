import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { EnvUnsupported } from 'src/components/EnvUnsupported.tsx';
import { Root } from 'src/components/Root.tsx';
import { init } from 'src/init.ts';

import './index.css';
import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  init(import.meta.env.DEV);
  root.render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
} catch {
  root.render(<EnvUnsupported />);
}
