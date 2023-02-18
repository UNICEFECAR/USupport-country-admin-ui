import { useEffect, useState } from "react";

const useCountdownTimer = (minutesInFuture = 30) => {
  const [startDate, setStartDate] = useState();
  const [countDown, setCountDown] = useState();

  useEffect(() => {
    setStartDate(
      new Date().setMinutes(new Date().getMinutes() + minutesInFuture)
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (startDate) {
        const newCountdown = startDate - new Date().getTime();
        const returnValues = getReturnValues(minutesInFuture, newCountdown);
        setCountDown(startDate - new Date().getTime());
        if (returnValues.reduce((a, b) => a + b) === 0) {
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  return getReturnValues(minutesInFuture, countDown);
};

const getReturnValues = (minutesInFuture, countDown) => {
  if (!countDown) return [0, 0, minutesInFuture - 1, 59];
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export { useCountdownTimer };
