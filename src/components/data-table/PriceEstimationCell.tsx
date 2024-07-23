import { useEffect, useState } from "react";

const GPU_PRICe_PER_SECOND = 0.00076;

function calculateCost(seconds: number) {
  return (seconds * GPU_PRICe_PER_SECOND).toFixed(2);
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return [hours, minutes, remainingSeconds]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
}
export function PriceEstimationCell({ row }: { row: any }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const doneStages = ["COMPLETED", "ERRORED", "CANCELED"];

  if (row.original.stage === "PENDING") {
    return (
      <div className="flex w-[50px] items-center justify-between">
        <span></span>
        <span className="text-muted-foreground">/</span>
        <span></span>
      </div>
    );
  } else if (doneStages.includes(row.original.stage)) {
    const startTime = new Date(row.original.start_time);
    const endTime = new Date(row.original.end_time);
    const timePassed = (endTime.getTime() - startTime.getTime()) / 1000;
    const cost = calculateCost(timePassed);

    return (
      <div className="flex w-[50px] items-center justify-between">
        <span>{cost}$</span>
        <span className="text-muted-foreground">/</span>
        <span>{cost}$</span>
      </div>
    );
  } else {
    const startTime = new Date(row.original.start_time);
    const timePassed = (currentTime.getTime() - startTime.getTime()) / 1000;
    const constUntilNow = calculateCost(timePassed);

    if (row.original.current_step > 10) {
      const startTrainTime = new Date(row.original.start_train_time);
      const timePassFromFirstStep =
        (new Date().getTime() - startTrainTime.getTime()) / 1000;
      const secondsForStep = timePassFromFirstStep / row.original.current_step;
      const totalTime = row.original.total_steps * secondsForStep;
      const constPrediction = calculateCost(totalTime);
      return (
        <div className="flex w-[50px] items-center justify-between">
          <span>{constUntilNow}$</span>
          <span className="text-muted-foreground">/</span>
          <span>{constPrediction}$</span>
        </div>
      );
    } else {
      return (
        <div className="flex w-[50px] items-center justify-between">
          <span>{constUntilNow}$</span>
          <span className="text-muted-foreground">/</span>
          <span></span>
        </div>
      );
    }
  }
}
