export interface Task {
  title: string;
  done: boolean;
  originKey: number;
}

export interface MainTask extends Task {
  _id: string;
  id: string;
  createAt?: Date;
  updateAt?: Date;
  subTask?: Task[];
  level?: number;
}
