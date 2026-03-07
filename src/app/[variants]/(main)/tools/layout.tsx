import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import { LayoutProps } from './_layout/type';

// Mobile falls back to Desktop for now
const ToolsLayout = ServerLayout<LayoutProps>({ Desktop, Mobile: Desktop });

ToolsLayout.displayName = 'ToolsLayout';

export default ToolsLayout;
