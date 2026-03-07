import { Suspense } from 'react';

import PasswordWorkspace from './features/PasswordWorkspace';

const PasswordPage = () => {
  return (
    <Suspense>
      <PasswordWorkspace />
    </Suspense>
  );
};

PasswordPage.displayName = 'PasswordPage';

export default PasswordPage;
