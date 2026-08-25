import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

interface ContainerProps extends PropsWithChildren {
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return <div className={clsx('container', className)}>{children}</div>;
}
