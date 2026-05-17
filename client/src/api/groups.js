import api from './axios';

export async function deleteGroup(groupId) {
  const res = await api.delete(`/groups/${groupId}`);
  return res.data;
}

export async function cancelGroup(groupId) {
  const res = await api.put(`/groups/${groupId}/cancel`);
  return res.data;
}
