export interface Game {
  uniqid: string;
  user_id: string | null;
  settings: number;
  time_limit: number;
  rounds: number;
  final_score: number | null;
  final_time: number | null;
  created_at: number;
}

export interface Round {
  id: number;
  game_uniqid: string;
  number: number;
  target_uuid: string;
  target_coordinates: {
    x: number;
    y: number;
  }
  guess_coordinates: {
    x: number;
    y: number;
  } | null;
  score: number | null;
  created_at: number;
  updated_at: number;
  ended_at: number | null;
}

export interface Settings {
  allowZoom: boolean;
  allowPan: boolean;
  allowMove: boolean;
  roundTime: number;
}
