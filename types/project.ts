export type ProjectStatus = "uploading" | "processing" | "ready" | "failed";

export type SttProject = {
  id: string;
  userId: string;
  title: string;
  mediaFileName: string;
  sourceLanguage?: string;
  durationSeconds?: number;
  status: ProjectStatus;
  createdAt: string;
};
