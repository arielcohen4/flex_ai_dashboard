import { createSlice } from "@reduxjs/toolkit";
import { JoinedCheckpoint } from "../types";

// Type for our state
export interface IEndpointState {
  type: string | null;
  checkpoints: JoinedCheckpoint[];
}

const initialState: IEndpointState = {
  type: null,
  checkpoints: [],
};

export const endpointSlice = createSlice({
  name: "endpoint",
  initialState,
  reducers: {
    // Action to set the authentication status
    setTypeState(state, action) {
      state.type = action.payload;
    },
    setCheckpointsState(state, action) {
      state.checkpoints = action.payload; // Set the playing video ID
    },
  },
});

export const { setTypeState, setCheckpointsState } = endpointSlice.actions;
export const endpointReducer = endpointSlice.reducer;
