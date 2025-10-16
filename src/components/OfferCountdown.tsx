import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface OfferCountdownProps {
  endDate: string;
  onExpire?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function OfferCountdown({ endDate, onExpire }: OfferCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        if (onExpire) {
          onExpire();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (timeRemaining.isExpired) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="w-5 h-5 text-white animate-pulse" />
        <span className="text-white font-bold text-sm uppercase tracking-wide">
          Offer Ends In
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="text-2xl font-bold text-white">{timeRemaining.days}</div>
          <div className="text-xs text-white/90 uppercase">Days</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="text-2xl font-bold text-white">{timeRemaining.hours}</div>
          <div className="text-xs text-white/90 uppercase">Hours</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="text-2xl font-bold text-white">{timeRemaining.minutes}</div>
          <div className="text-xs text-white/90 uppercase">Mins</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="text-2xl font-bold text-white">{timeRemaining.seconds}</div>
          <div className="text-xs text-white/90 uppercase">Secs</div>
        </div>
      </div>
    </div>
  );
}
