export interface Record {
    _id: string;
    source: string;
    translation: string;
    exp: number;
    cooldownAt: Date;
  }