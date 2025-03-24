
'use client';

export default function AnimationStyles() {
  return (
    <style jsx global>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Add staggered animation for comparison bars */
      .animated-section > div:nth-child(n) {
        animation-delay: calc(0.1s * var(--index, 0));
      }
      
      .animated-section {
        animation: fadeUp 0.8s ease-out forwards;
        opacity: 0;
      }
    `}</style>
  );
}