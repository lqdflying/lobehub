import { memo } from 'react';

import { ErrorActionContainer } from '@/features/Conversation/Error/style';

import APIKeyForm from './APIKeyForm';

interface InvalidAPIKeyProps {
  description: string;
  id: string;
  onClose: () => void;
  onRecreate: () => void;
  provider?: string;
}
const InvalidAPIKey = memo<InvalidAPIKeyProps>(
  ({ id, provider, description, onRecreate, onClose }) => (
    <ErrorActionContainer>
      <APIKeyForm
        description={description}
        id={id}
        onClose={onClose}
        onRecreate={onRecreate}
        provider={provider}
      />
    </ErrorActionContainer>
  ),
);

export default InvalidAPIKey;
