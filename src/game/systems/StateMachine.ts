// ═══════════════════════════════════════════════════
// Data Dash — Generic Finite State Machine
// ═══════════════════════════════════════════════════

export interface StateConfig {
  enter?: () => void;
  update?: (dt: number) => void;
  exit?: () => void;
}

export class StateMachine {
  private states: Map<string, StateConfig> = new Map();
  private currentState: string | null = null;
  private previousState: string | null = null;

  addState(name: string, config: StateConfig): this {
    this.states.set(name, config);
    return this;
  }

  setState(name: string): void {
    if (name === this.currentState) return;
    if (!this.states.has(name)) {
      console.warn(`StateMachine: unknown state "${name}"`);
      return;
    }

    // Exit current
    if (this.currentState) {
      const current = this.states.get(this.currentState);
      current?.exit?.();
    }

    this.previousState = this.currentState;
    this.currentState = name;

    // Enter new
    const next = this.states.get(name);
    next?.enter?.();
  }

  update(dt: number): void {
    if (!this.currentState) return;
    const state = this.states.get(this.currentState);
    state?.update?.(dt);
  }

  getState(): string | null {
    return this.currentState;
  }

  getPreviousState(): string | null {
    return this.previousState;
  }

  isState(name: string): boolean {
    return this.currentState === name;
  }
}
