export interface ViewData {
  uuid: string,
  position: {
    x: number,
    y: number,
    z: number,
    r: number,
  },
  neighbors: string[]
}
export interface ViewDataVerbose extends ViewData {
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
}

export interface View {
  target: ViewData,
  neighbors: ViewData[],
}

export interface GetView {
  data: View
}

export interface GetVerboseCoordinates {
  data: ViewData[]
}
