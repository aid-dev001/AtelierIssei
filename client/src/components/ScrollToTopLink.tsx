import { Link } from "wouter";
import { ComponentProps, useCallback, ReactNode } from "react";

type ScrollToTopLinkProps = Omit<ComponentProps<typeof Link>, 'onClick'> & {
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
};

const ScrollToTopLink = ({ children, onClick, className, ...props }: ScrollToTopLinkProps) => {
  const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (onClick) onClick(event);
  }, [onClick]);

  return (
    <Link href={props.to || '/'} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default ScrollToTopLink;
