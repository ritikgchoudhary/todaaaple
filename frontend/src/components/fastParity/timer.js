import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      // Timer has reached 0, perform the desired action here
      // For example, you can display an alert or execute a function
      console.log("1 minute has passed!");
      
      // Reset the timer to 60 seconds
      setTimer(60);
    }
  }, [timer]);

  return (
    <div>
      <h1>Countdown: {timer} seconds</h1>
    </div>
  );
};

export default Timer;
