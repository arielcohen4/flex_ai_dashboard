import posthog from "posthog-js";

const TrackService = {
  send: ({ name, properties }: { name: string; properties?: any }) => {
    try {
      posthog.capture(name, properties);
    } catch (error) {
      console.error("Error capturing event:", error);
    }
  },
};

export default TrackService;
