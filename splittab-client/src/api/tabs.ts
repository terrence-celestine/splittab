import api from "../lib/axios";

export async function createTab(name: string) {
  const res = await api.post("/tabs", { name });
  return res.data;
}

export async function joinTab(roomCode: string) {
  const res = await api.post("/tabs/join", { roomCode });
  return res.data;
}

export async function getTab(id: string) {
  const res = await api.get(`/tabs/${id}`);
  return res.data;
}

export async function leaveTab(tabId: string) {
  const res = await api.delete(`/tabs/${tabId}/leave`);
  return res.data;
}
