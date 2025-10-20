import React from 'react';

const PulsingSoundWave: React.FC = () => {
  return (
    <div className="flex justify-center items-center gap-2 h-24 w-48">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="w-2 flow-gradient-background rounded-full"
          style={{
            // Combine both animations so one doesn't override the other
            animation: `wave 1.5s infinite ease-in-out, flow-gradient 10s ease-in-out infinite`,
            // Provide a delay for each animation respectively
            animationDelay: `-${(9 - i) * 0.15}s, 0s`,
            backgroundAttachment: 'fixed',
          }}
        ></div>
      ))}
    </div>
  );
};

export default PulsingSoundWave;
