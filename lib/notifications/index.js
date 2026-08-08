const KEY = 'agencyos_notifications'
const LIMIT = 100

function read() { try { return typeof window === 'undefined' ? [] : JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function write(items) { try { if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(items.slice(0, LIMIT))) } catch {} }
export function getNotifications() { return read() }
export function addNotification(notification) { const item = { id: `n_${Date.now()}`, read: false, timestamp: Date.now(), ...notification }; write([item, ...read()]); return item }
export function markNotificationsRead() { write(read().map((item) => ({ ...item, read: true }))) }
export function clearNotifications() { write([]) }
