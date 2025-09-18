import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 10000,
});

export interface Device {
  name: string;
  browser: string;
  last_login: string;
}

export interface ProgressEntry {
  question_slug: string;
  score: number;
  completed_at: string;
}

export interface User {
  username: string;
  is_admin: boolean;
  devices: Device[];
  progress: ProgressEntry[];
}

export interface Chapter {
  slug: string;
  title: string;
  order: number;
  description?: string | null;
  body: string;
}

export interface Question {
  slug: string;
  chapter: string;
  difficulty: string;
  type: string;
  memory_limit?: number | null;
  show_in_tutorial: boolean;
  show_in_bank: boolean;
  prompt: string;
  answer?: string | null;
  explanation?: string | null;
  common_mistakes?: string | null;
  advanced_insights?: string | null;
}

export interface QuestionOut {
  slug: string;
  chapter: string;
  difficulty: string;
  type: string;
  memory_limit?: number | null;
  show_in_tutorial: boolean;
  show_in_bank: boolean;
  prompt: string;
  answer?: string | null;
  explanation?: string | null;
  common_mistakes?: string | null;
  advanced_insights?: string | null;
}

export interface ChapterUpsertPayload {
  slug: string;
  title: string;
  order: number;
  description?: string | null;
  body: string;
}

export interface QuestionUpsertPayload {
  slug: string;
  chapter: string;
  difficulty: string;
  type: string;
  memory_limit?: number | null;
  show_in_tutorial?: boolean;
  show_in_bank?: boolean;
  prompt: string;
  answer?: string | null;
  explanation?: string | null;
  common_mistakes?: string | null;
  advanced_insights?: string | null;
}


export interface JudgeResult {
  passed: boolean;
  feedback_steps: string[];
}

export interface ExecutionPayload {
  code: string;
  stdin?: string | null;
  time_limit?: number | null;
  memory_limit?: number | null;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string | null;
}

export const register = (username: string, password: string) =>
  client.post<{ user: User }>("/auth/register", { username, password });

export const login = (
  username: string,
  password: string,
  device_name: string,
  browser: string
) =>
  client.post<{ user: User }>("/auth/login", {
    username,
    password,
    device_name,
    browser,
  });

export const removeDevice = (
  username: string,
  device_name: string,
  browser: string
) => client.delete<{ user: User }>("/auth/device", { data: { username, device_name, browser } });

export const listChapters = () => client.get<Chapter[]>("/content/chapters");
export const getChapter = (slug: string) => client.get<Chapter>(`/content/chapters/${slug}`);

export const listQuestions = (params?: { chapter?: string; difficulty?: string }) =>
  client.get<Question[]>("/content/questions", { params });

export const getQuestion = (slug: string) => client.get<Question>(`/content/questions/${slug}`);

export const recordProgress = (username: string, question_slug: string, score: number) =>
  client.post<{ user: User }>("/progress/record", { username, question_slug, score });

export const judgeAnswer = (system_prompt: string, prompt: string) =>
  client.post<JudgeResult>("/judge/evaluate", { system_prompt, prompt });

export const executeCode = (payload: ExecutionPayload) =>
  client.post<ExecutionResult>("/execute/run", payload);

export const adminListUsers = () => client.get<User[]>("/admin/users");
export const adminListQuestions = () => client.get<Question[]>("/admin/questions");
export const adminUpsertChapter = (payload: ChapterUpsertPayload) =>
  client.post<Chapter>("/admin/chapters", payload);
export const adminUpsertQuestion = (payload: QuestionUpsertPayload) =>
  client.post<Question>("/admin/questions", payload);
