import React from 'react';

const ChefIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.5 19H7.5V12C7.5 10.8954 8.39543 10 9.5 10H14.5C15.6046 10 16.5 10.8954 16.5 12V19Z" fill="white"/>
    <circle cx="12" cy="7" r="3" fill="white"/>
    <path d="M8 4C8 3.44772 7.55228 3 7 3C6.44772 3 6 3.44772 6 4V5C6 5.55228 6.44772 6 7 6C7.55228 6 8 5.55228 8 5V4Z" fill="white"/>
    <path d="M12 3C11.4477 3 11 3.44772 11 4C11 4.55228 11.4477 5 12 5C12.5523 5 13 4.55228 13 4C13 3.44772 12.5523 3 12 3Z" fill="white"/>
    <path d="M16 4C16 3.44772 16.4477 3 17 3C17.5523 3 18 3.44772 18 4V5C18 5.55228 17.5523 6 17 6C16.4477 6 16 5.55228 16 5V4Z" fill="white"/>
  </svg>
);

export default ChefIcon;