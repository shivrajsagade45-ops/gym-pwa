const API_URL = "https://gym-api.fitnessfreaks.workers.dev";

export async function getMembers() {
  const res = await fetch(`${API_URL}/members`);
  return res.json();
}

export async function addMember(data: any) {
  const res = await fetch(`${API_URL}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}