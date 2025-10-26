import { db, type Client } from "./db"

export function createClient(clientData: Omit<Client, "id">): Client {
  const newClient: Client = {
    ...clientData,
    id: Date.now().toString(),
  }
  db.clients.push(newClient)
  return newClient
}

export function getClientById(id: string): Client | undefined {
  return db.clients.find((c) => c.id === id)
}

export function getClientsBySupervisor(supervisorId: string): Client[] {
  return db.clients.filter((c) => c.supervisorId === supervisorId)
}

export function getClientsByCity(city: string): Client[] {
  return db.clients.filter((c) => c.city === city)
}

export function getAllClients(): Client[] {
  return db.clients
}

export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const client = db.clients.find((c) => c.id === id)
  if (!client) return null

  Object.assign(client, updates)
  return client
}

export function deleteClient(id: string): boolean {
  const index = db.clients.findIndex((c) => c.id === id)
  if (index === -1) return false
  db.clients.splice(index, 1)
  return true
}
