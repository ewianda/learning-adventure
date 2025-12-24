
import React from 'react';

export const SUBJECTS = ['Math', 'Reading', 'Spelling'];
export const AVATARS = ['emoji-grinning-face', 'emoji-star-struck', 'emoji-smiling-face-with-sunglasses', 'emoji-winking-face', 'emoji-nerd-face', 'emoji-robot'];
export const GRADES = ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8'];
export const QUIZ_LENGTH = 10;

export const HeaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.25a.75.75 0 01.75.75v2.519a5.24 5.24 0 012.381.565l1.89-1.482a.75.75 0 11.938 1.18l-1.89 1.482a5.25 5.25 0 011.482 1.89l1.482-1.89a.75.75 0 111.18.938l-1.482 1.89a5.24 5.24 0 01.565 2.381h2.519a.75.75 0 110 1.5h-2.519a5.24 5.24 0 01-.565 2.381l1.482 1.89a.75.75 0 11-.938 1.18l-1.482-1.89a5.25 5.25 0 01-1.89 1.482l1.89 1.482a.75.75 0 11-.938 1.18l-1.89-1.482a5.24 5.24 0 01-2.381.565v2.519a.75.75 0 11-1.5 0v-2.519a5.24 5.24 0 01-2.381-.565l-1.89 1.482a.75.75 0 11-.938-1.18l1.89-1.482a5.25 5.25 0 01-1.482-1.89l-1.482 1.89a.75.75 0 11-1.18-.938l1.482-1.89a5.24 5.24 0 01-.565-2.381H2.25a.75.75 0 110-1.5h2.519a5.24 5.24 0 01.565-2.381l-1.482-1.89a.75.75 0 11.938-1.18l1.482 1.89a5.25 5.25 0 011.89-1.482L4.312 4.43a.75.75 0 11.938-1.18l1.89 1.482A5.24 5.24 0 019.53 3.519V.75A.75.75 0 0110.28.03L12 2.25zm0 0z" />
        <path d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
    </svg>
);

export const Avatar = ({ name, className }: { name: string, className?: string }) => {
    const baseClass = "text-5xl";
    const finalClassName = `${baseClass} ${className || ''}`;
    switch (name) {
        case 'emoji-grinning-face': return <span className={finalClassName}>😀</span>;
        case 'emoji-star-struck': return <span className={finalClassName}>🤩</span>;
        case 'emoji-smiling-face-with-sunglasses': return <span className={finalClassName}>😎</span>;
        case 'emoji-winking-face': return <span className={finalClassName}>😉</span>;
        case 'emoji-nerd-face': return <span className={finalClassName}>🤓</span>;
        case 'emoji-robot': return <span className={finalClassName}>🤖</span>;
        default: return <span className={finalClassName}>🙂</span>;
    }
};

export const SpellingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
);
