import { Link } from "wouter";
import { ComponentProps, useCallback } from "react";

type ScrollToTopLinkProps = ComponentProps<typeof Link> & {
  className?: string;
};

const ScrollToTopLink = ({ children, onClick, className, ...props }: ScrollToTopLinkProps) => {
  const handleClick = useCallback((event: React.MouseEvent) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (onClick) onClick(event);
  }, [onClick]);

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default ScrollToTopLink;
