export interface VerboseCoordinates {
  position: {
    x: number,
    y: number,
    z: number,
    r: number,
  },
  inVehicle: boolean,
  weather: {
    region: number,
    old: number,
    new: number,
  },
  wavyness: number,
  time: {
    hours: number,
    minutes: number,
  },
  quaternion: {
    x: number,
    y: number,
    z: number,
    r: number,
  },
  uuid: string,
  neighbors: string[]
}

export interface View {
  target: VerboseCoordinates,
  neighbors: VerboseCoordinates[],
}

export interface GetView {
  data: View
}

export interface GetVerboseCoordinates {
  data: VerboseCoordinates[]
}
