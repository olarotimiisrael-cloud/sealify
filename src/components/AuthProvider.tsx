import { ReactNode } from 'react';

export default ({ children }: { children: ReactNode }) => {
  // This provider can later be enhanced with auth context if needed.
  return children;
});