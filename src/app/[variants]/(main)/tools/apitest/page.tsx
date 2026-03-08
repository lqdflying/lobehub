import { Suspense } from 'react';

import ApitestWorkspace from './features/ApitestWorkspace';

const ApitestPage = () => {
  return (
    <Suspense>
      <ApitestWorkspace />
    </Suspense>
  );
};

ApitestPage.displayName = 'ApitestPage';

export default ApitestPage;
