import { Project, WorkspaceRole } from "./types";

export const roles: WorkspaceRole[] = [
  "Read only",
  "Project admin",
  "Organization admin",
  "Customer success manager",
  "Assigned organization manager",
  "Project collaborator",
];
export const templates = ["Website & brand", "Product development", "Consulting engagement"];
export const createProject = (name: string, template: string): Project => ({
  id: crypto.randomUUID(),
  name,
  template,
  description: `A new ${template.toLowerCase()} project. Let's build something great together.`,
  progress: 0,
  due: "Not scheduled",
  milestones: (template === "Website & brand"
    ? ["Discovery & strategy", "Brand & visual direction", "Design & development", "Launch & handoff"]
    : template === "Product development"
      ? ["Requirements", "Prototype", "Implementation", "Release"]
      : ["Kickoff", "Research", "Recommendations", "Handoff"]
  ).map((title) => ({ title, date: "Not scheduled", done: false })),
  documents: [],
  discussions: [],
});

export const initialProjects: Project[] = [
  {
    id: "website",
    name: "Website redesign",
    template: "Website & brand",
    description: "A fresh digital experience. Built around your next chapter.",
    progress: 68,
    due: "Nov 20, 2026",
    milestones: [
      { title: "Discovery & strategy", date: "Oct 02", done: true },
      { title: "Brand & visual direction", date: "Oct 12", done: true },
      { title: "Design & development", date: "Nov 06", done: false },
      { title: "Launch & handoff", date: "Nov 20", done: false },
    ],
    documents: [
      {
        id: "brief",
        title: "Project brief",
        kind: "Google Docs",
        folder: "Requirements",
        url: "https://docs.google.com/",
        comments: ["Please add the final audience requirements here."],
      },
      {
        id: "brand",
        title: "Brand guidelines",
        kind: "Google Drive",
        folder: "Design",
        url: "https://drive.google.com/",
        comments: [],
      },
      {
        id: "content",
        title: "Content inventory",
        kind: "Google Sheets",
        folder: "Requirements",
        url: "https://sheets.google.com/",
        comments: [],
      },
    ],
    discussions: [
      {
        id: "review",
        title: "Homepage designs are ready for your feedback",
        label: "Design",
        author: "Emma Wilson",
        body: "The first round of homepage concepts is ready! Take a look at the brand guidelines and let us know which direction feels right for your team.",
        replies: ["The first direction looks great. Can we explore a simpler navigation?"],
        unread: true,
        resolved: false,
      },
      {
        id: "content-review",
        title: "A few things we need for the next milestone",
        label: "Requirements",
        author: "Alex Morgan",
        body: "Please share your updated service descriptions and team photos in the Requirements folder before we begin the next phase.",
        replies: [],
        unread: true,
        resolved: false,
      },
      {
        id: "kickoff",
        title: "A great kickoff. Here's what happens next.",
        label: "General",
        author: "Emma Wilson",
        body: "Thanks for a productive kickoff! We have captured the goals and agreed on the project milestones. This thread is our place for general questions.",
        replies: ["Thanks, looking forward to it!"],
        unread: false,
        resolved: true,
      },
    ],
  },
  {
    id: "platform",
    name: "Customer platform",
    template: "Product development",
    description: "Turning a better customer experience into a working product.",
    progress: 24,
    due: "Dec 18, 2026",
    milestones: [
      { title: "Requirements", date: "Oct 10", done: true },
      { title: "Prototype", date: "Oct 30", done: false },
      { title: "Implementation", date: "Nov 30", done: false },
      { title: "Release", date: "Dec 18", done: false },
    ],
    documents: [],
    discussions: [],
  },
];
