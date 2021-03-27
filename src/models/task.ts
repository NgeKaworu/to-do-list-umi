export interface Task {
  title: string;
  done: boolean;
}

export interface MainTask extends Task {
  _id?: string;
  createAt: Date;
  updateAt?: Date;
  subTask?: Task[];
  level: number;
}
