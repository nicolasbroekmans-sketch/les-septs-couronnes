// Bus d'événements central : les systèmes communiquent sans dépendre les uns des autres.
export class EventBus {
  constructor() { this.handlers = new Map(); }
  on(type, fn) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type).add(fn);
    return () => this.off(type, fn);
  }
  off(type, fn) { this.handlers.get(type)?.delete(fn); }
  emit(type, payload = {}) {
    for (const fn of [...(this.handlers.get(type) ?? [])]) fn(payload, type);
    for (const fn of [...(this.handlers.get('*') ?? [])]) fn(payload, type);
  }
}
