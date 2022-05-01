export interface User {
  id: number;
  discord_id: string;
  discord_name: string;
  discord_discriminator: string;
  discord_avatar: Nullable<string>;
  twitch: Nullable<string>;
  twitter: Nullable<string>;
  youtube_id: Nullable<string>;
  youtube_name: Nullable<string>;
  friend_code: Nullable<string>;
}

export interface Organization {
  id: number;
  name: string;
  name_for_url: string;
  owner_id: number;
  discord_invite: string;
  twitter: Nullable<string>;
}

export interface Tournament {
  id: number;
  name: string;
  name_for_url: string;
  description: string;
  start_time_timestamp: number;
  check_in_start_timestamp: number;
  banner_background: string;
  banner_text_hsl_args: string;
  banner_text_color: string;
  banner_text_color_transparent: string;
  organizer_id: number;
}

export type BracketType = "SE" | "DE";

export interface TournamentBracket {
  id: number;
  tournament_id: number;
  type: BracketType;
}
