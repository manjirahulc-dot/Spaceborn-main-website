'use client';
import { forwardRef, ReactNode, useRef, useEffect, useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  children: ReactNode;
}

export const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(
  ({ children, style, onLoadedData, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLVideoElement>(null);
    const [hasIntersected, setHasIntersected] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Start loading well before the tile reaches the screen
    const entry = useIntersectionObserver(internalRef, {
      freezeOnceVisible: true,
      rootMargin: '1000px 0px',
    });

    useEffect(() => {
      if (entry?.isIntersecting) {
        setHasIntersected(true);
      }
    }, [entry?.isIntersecting]);

    // Once the sources are in the DOM, tell the browser to start fetching
    useEffect(() => {
      if (hasIntersected) {
        internalRef.current?.load();
      }
    }, [hasIntersected]);

    // Handle ref forwarding
    useEffect(() => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(internalRef.current);
      } else if (forwardedRef) {
        forwardedRef.current = internalRef.current;
      }
    }, [forwardedRef, internalRef]);

    return (
      <video
        ref={internalRef}
        preload="auto"
        {...props}
        style={{
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.4s ease',
          ...style,
        }}
        onLoadedData={(e) => {
          setIsReady(true);
          onLoadedData?.(e);
        }}
      >
        {hasIntersected ? children : null}
      </video>
    );
  }
);

LazyVideo.displayName = 'LazyVideo';