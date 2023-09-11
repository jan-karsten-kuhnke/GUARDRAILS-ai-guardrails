import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { AuthService } from "../AuthService";

const _axios: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_CHAT_SERVICE_URL,
});

const handleSuccess = (response: any) => response;

const handleError = (error: any) => {
  if (error?.response?.status === 401) {
    AuthService.doLogout();
  }
  return Promise.reject(error);
};

_axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // eslint-disable-next-line no-param-reassign
  config.headers.Authorization = `Bearer ${AuthService.getToken()}`;
  config.headers["Content-Type"] = "application/json";
  if (config.url == "/chat/executeondoc" && config.method == "post") {
    config.headers["Content-Type"] = "multipart/form-data";
  }
  config.headers["Access-Control-Allow-Origin"] = "*";
  return config;
});

_axios.interceptors.response.use(handleSuccess, handleError);

//chat => endpoints={baseURL}/chat

export const fetchPrompt = (
  message: string,
  conversation_id: string | null,
  task: string | undefined,
  isPrivate: boolean | undefined,
  task_params:object ,
) =>
  fetch(`${import.meta.env.VITE_CHAT_SERVICE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AuthService.getToken()}`,
    },
    body: JSON.stringify(
      conversation_id
        ? {
          message: message,
          conversation_id: conversation_id,
          task: task,
          task_params: task_params,
        }
        : { message: message }
    ),
  });

export const archiveConversations = () => {
  return _axios.delete("/chat/conversations/archive");
};

export const archiveUnarchiveConversation = (
  conversationId: string,
  isArchived: boolean
) => {
  return _axios.delete(
    `/chat/conversations/archive/${conversationId}?flag=${isArchived}`
  );
};

export const executeOnDoc = (formData: FormData) =>
  fetch(`${import.meta.env.VITE_CHAT_SERVICE_URL}/chat/executeondoc`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AuthService.getToken()}`,
    },
    body: formData,
  });

export const fetchAllConversations = (getArchived: boolean) => {
  return _axios.get(`/chat/conversations?archived=${getArchived}`);
};

export const fetchConversationById = (id: string) => {
  return _axios.get(`/chat/conversations/${id}`);
};

export const updateConversationProperties = (
  conversationId: string,
  title: string,
  folderId: string | null
) => {
  return _axios.put(`/chat/conversations/${conversationId}/properties`, {
    title: title,
    folderId: folderId,
  });
};

export const requestApproval = (conversationId: string) => {
  return _axios.get(`/chat/requestapproval/${conversationId}`);
};

//pii => enpoints={baseURL}/pii

export const analyzeMessage = (message: string) => {
  return _axios.post("/pii/analyze", { message: message });
};

export const anonymizeMessage = (message: string) => {
  return _axios.post("/pii/anonymize", { message: message });
};

//folders and prompts => endpoints={baseURL}/user

export const fetchFolders = () => {
  return _axios.get("/user/folders");
};

export const updateUserFolders = (folders: any) => {
  return _axios.put("/user/folders", folders);
};

export const fetchPrompts = () => {
  return _axios.get("/user/prompts");
};

export const updateUserPrompts = (prompts: any) => {
  return _axios.put("/user/prompts", prompts);
};

export const getTiles = () => {
  return _axios.get(`/user/tiles`);
};

export const RequestAccess = (params: any) => {
  return _axios.post(`/user/access_request`, params);
};

export const getEulaStatus = () => {
  return _axios.get(`/user/eula`);
};

export const setEulaStatus = () => {
  return _axios.post(`/user/eula`);
};
