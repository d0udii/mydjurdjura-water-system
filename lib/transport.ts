import { db, type TransportTariff } from "./db"

export function createTransportTariff(tariffData: Omit<TransportTariff, "id">): TransportTariff {
  const newTariff: TransportTariff = {
    ...tariffData,
    id: Date.now().toString(),
  }
  db.transportTariffs.push(newTariff)
  return newTariff
}

export function getTariffByCity(city: string): TransportTariff | undefined {
  return db.transportTariffs.find((t) => t.city === city)
}

export function getAllTariffs(): TransportTariff[] {
  return db.transportTariffs
}

export function updateTariff(id: string, updates: Partial<TransportTariff>): TransportTariff | null {
  const tariff = db.transportTariffs.find((t) => t.id === id)
  if (!tariff) return null

  Object.assign(tariff, updates)
  return tariff
}

export function deleteTariff(id: string): boolean {
  const index = db.transportTariffs.findIndex((t) => t.id === id)
  if (index === -1) return false
  db.transportTariffs.splice(index, 1)
  return true
}
