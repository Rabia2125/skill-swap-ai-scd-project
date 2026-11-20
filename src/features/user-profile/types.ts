import { UserSkill } from '../../types';

export interface UpdateProfilePayload {
  name?: string;
  location?: string;
  title?: string;
  bio?: string;
  avatar?: string;
  skillsToTeach?: UserSkill[];
  skillsToLearn?: string[];
  experience?: string;
  education?: string;
  availability?: string;
  learningGoals?: string;
}
