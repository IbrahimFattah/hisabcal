'use client';

export function useConfetti() {
  const fire = async () => {
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'],
      });
    } catch {
      // Graceful fallback
    }
  };

  return { fire };
}
