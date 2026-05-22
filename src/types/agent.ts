export type AgentRole = 'ADMIN' | 'OPERATOR';

export type Agent = {
  email: string;
  id: string;
  initials: string;
  name: string;
  online: boolean;
  role: AgentRole;
  username: string;
};
