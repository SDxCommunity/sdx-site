import React from 'react';

interface ChapterNameProps {
  name: string;
  className?: string;
  /** "bold" draws a heavier outline, for names set large on cards. */
  outline?: 'thin' | 'bold';
}

const ChapterName: React.FC<ChapterNameProps> = ({ name, className = '', outline = 'thin' }) => {
  // Split "SDxUCSD" into "SDx" + "UCSD"
  const prefix = 'SDx';
  const suffix = name.startsWith(prefix) ? name.slice(prefix.length) : '';

  if (!suffix) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span className={className}>
      {prefix}<span className={outline === 'bold' ? 'text-outline-bold' : 'text-outline-thin'}>{suffix}</span>
    </span>
  );
};

export default ChapterName;
