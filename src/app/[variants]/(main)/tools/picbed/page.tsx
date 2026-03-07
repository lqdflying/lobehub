import { Suspense } from 'react';

import PicbedWorkspace from './features/PicbedWorkspace';

const PicbedPage = () => {
  return (
    <Suspense>
      <PicbedWorkspace />
    </Suspense>
  );
};

PicbedPage.displayName = 'PicbedPage';

export default PicbedPage;
