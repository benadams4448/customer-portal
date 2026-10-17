export type WorkspaceRole =
  | "Read only"
  | "Project admin"
  | "Organization admin"
  | "Customer success manager"
  | "Assigned organization manager"
  | "Project collaborator";
export type Milestone = { title: string; date: string; done: boolean };
export type DocumentLink = { id: string; title: string; url: string; kind: string; folder: string; comments: string[] };
export type Discussion = {
  id: string;
  title: string;
  label: string;
  author: string;
  body: string;
  replies: string[];
  unread: boolean;
  resolved: boolean;
};
export type Project = {
  id: string;
  name: string;
  description: string;
  progress: number;
  due: string;
  template: string;
  milestones: Milestone[];
  documents: DocumentLink[];
  discussions: Discussion[];
};
