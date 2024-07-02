import { Priority } from '../../enum/priority';

export interface ITask {
  id?: number | null;
  title?: string | null;
  description?: string | null;
  priority?: Priority | null | number;
  isComplete?: boolean | null;
  createdAt?:Date,
  updatedAt?:Date,
}
