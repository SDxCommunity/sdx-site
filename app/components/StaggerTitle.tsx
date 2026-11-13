import React from 'react';
import styles from './StaggerTitle.module.css';

type StaggerTitleProps = {
  text: string;
  /** Letters from this index on render as outlines, for chapter names such as SDxUCSD. */
  outlineFrom?: number;
  as?: 'h1' | 'h2';
  className?: string;
  /** Seconds before the first letter rises. */
  delay?: number;
  /** Seconds between letters. */
  step?: number;
};

/**
 * A display title whose letters rise one after another. Each word stays on one
 * line, and the title can still wrap between words on narrow screens.
 */
export default function StaggerTitle({
  text,
  outlineFrom,
  as: Tag = 'h1',
  className = '',
  delay = 0.2,
  step = 0.055,
}: StaggerTitleProps) {
  let index = 0;

  return (
    <Tag aria-label={text} className={className}>
      {text.split(' ').map((word, w) => (
        <React.Fragment key={w}>
          {w > 0 && ' '}
          <span className="inline-block whitespace-nowrap" aria-hidden="true">
            {Array.from(word).map((ch) => {
              const i = index++;
              return (
                <span
                  key={i}
                  className={`${styles.letter} ${outlineFrom !== undefined && i >= outlineFrom ? 'text-outline' : ''}`}
                  style={{ '--letter-delay': `${(delay + i * step).toFixed(3)}s` } as React.CSSProperties}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        </React.Fragment>
      ))}
    </Tag>
  );
}
