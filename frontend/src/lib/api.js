const API_URL = import.meta.env.VITE_API_URL;

function apiUrl(path) {
  if (!API_URL) {
    throw new Error("Set VITE_API_URL to your Cloudflare Worker URL.");
  }

  return `${API_URL}${path}`;
}

export async function getCalls() {
  const response = await fetch(apiUrl("/calls"));

  if (!response.ok) {
    throw new Error("Failed to fetch calls");
  }

  return response.json();
}

export async function getCall(id) {
  const response = await fetch(apiUrl(`/calls/${id}`));

  if (!response.ok) {
    throw new Error("Failed to fetch call");
  }

  return response.json();
}

export async function saveCall(call) {
  const response = await fetch(apiUrl("/calls"), {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(call),
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to save call: ${error}`
    );
  }

  return response.json();
}

export async function deleteCall(id) {
  const response = await fetch(apiUrl(`/calls/${id}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Failed to delete call: ${error}`
    );
  }

  return response.json();
}