import { useEffect, useState } from "react";

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  // const remainingSeconds = Math.floor(seconds % 60);

  return [hours, minutes].map((v) => v.toString().padStart(2, "0")).join(":");
}

export function DivisionComponent({current, outOf}: {current?: string, outOf?: string}) {
  return  <div className="flex w-[50px] items-center justify-between">
  <span>{current}</span>
  <span className="text-muted-foreground">/</span>
  <span>{outOf}</span>
</div>
}
export function TimeProgressCell({ row }: { row: any }) {
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
      <DivisionComponent />
    );
  } 
  
  if (doneStages.includes(row.original.stage)) {
    if (row.original.start_time == null) {
      return (
        <DivisionComponent />
      );
    } else {
      const startTime = new Date(row.original.start_time);
      const endTime = new Date(row.original.end_time);
      const timePassed = (endTime.getTime() - startTime.getTime()) / 1000;
      const formattedTime = formatDuration(timePassed);
      const formattedEstimation = formatDuration(timePassed);

      return (
        <DivisionComponent current={formattedTime} outOf={formattedEstimation} />
      );
    }
  } 
  const startTime = new Date(row.original.start_time);
  const timePassed = (currentTime.getTime() - startTime.getTime()) / 1000;
  const formattedTime = formatDuration(timePassed);

  if (row.original.current_step > 10) {
    const startTrainTime = new Date(row.original.start_train_time);
    const timePassFromFirstStep =
      (new Date().getTime() - startTrainTime.getTime()) / 1000;
    const secondsForStep = timePassFromFirstStep / row.original.current_step;
    const totalTime = row.original.total_steps * secondsForStep;
    const formattedTotalTime = formatDuration(totalTime);
    return (
      <DivisionComponent current={formattedTime} outOf={formattedTotalTime} />
    );
  } else {
    return (
      <DivisionComponent current={formattedTime} />
    );
  }
}
