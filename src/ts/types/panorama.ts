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

export interface GetRandomCoordinates {
  data: {
    target: VerboseCoordinates,
    neighbors: VerboseCoordinates[],
  }
}

export interface GetVerboseCoordinates {
  data: VerboseCoordinates[]
}
