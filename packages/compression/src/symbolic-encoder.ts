/**
 * SYMBOLIC ENCODER - Layer 1
 *
 * Converts common patterns to symbolic glyphs.
 * Target: 85% token reduction for common operations.
 */

export class SymbolicEncoder {
  private symbolMap: Map<string, string> = new Map();
  private reverseMap: Map<string, string> = new Map();

  constructor() {
    this.initializeSymbolMap();
  }

  /**
   * Encode text using symbolic glyphs
   */
  async encode(text: string): Promise<{
    encoded: string;
    savings_percent: number;
  }> {
    let encoded = text;

    // Sort by pattern length (longest first) to avoid partial matches
    const patterns = Array.from(this.symbolMap.keys()).sort((a, b) => b.length - a.length);

    for (const pattern of patterns) {
      const symbol = this.symbolMap.get(pattern)!;
      const regex = new RegExp(this.escapeRegex(pattern), 'gi');
      encoded = encoded.replace(regex, symbol);
    }

    const savings_percent = ((text.length - encoded.length) / text.length) * 100;

    return { encoded, savings_percent };
  }

  /**
   * Decode symbolic glyphs back to text
   */
  async decode(encoded: string): Promise<string | null> {
    let decoded = encoded;
    let changed = false;

    for (const [symbol, pattern] of this.reverseMap.entries()) {
      if (decoded.includes(symbol)) {
        decoded = decoded.replaceAll(symbol, pattern);
        changed = true;
      }
    }

    return changed ? decoded : null;
  }

  /**
   * Add custom symbol mapping
   */
  addSymbol(pattern: string, symbol: string): void {
    this.symbolMap.set(pattern, symbol);
    this.reverseMap.set(symbol, pattern);
  }

  // Private helpers

  private initializeSymbolMap(): void {
    // Common programming patterns
    this.symbolMap.set('function', '⨍');
    this.symbolMap.set('return', '⏎');
    this.symbolMap.set('const', '◊');
    this.symbolMap.set('let', '◆');
    this.symbolMap.set('var', '◇');
    this.symbolMap.set('async', '⚡');
    this.symbolMap.set('await', '⏳');
    this.symbolMap.set('import', '←');
    this.symbolMap.set('export', '→');
    this.symbolMap.set('class', '◘');
    this.symbolMap.set('interface', '◙');
    this.symbolMap.set('type', '◉');

    // Common operations
    this.symbolMap.set('create', '✚');
    this.symbolMap.set('update', '↻');
    this.symbolMap.set('delete', '✖');
    this.symbolMap.set('get', '⇒');
    this.symbolMap.set('set', '⇐');
    this.symbolMap.set('check', '✓');
    this.symbolMap.set('validate', '✔');
    this.symbolMap.set('error', '⚠');
    this.symbolMap.set('warning', '⚡');
    this.symbolMap.set('success', '✓');

    // Logical operations
    this.symbolMap.set('and', '∧');
    this.symbolMap.set('or', '∨');
    this.symbolMap.set('not', '¬');
    this.symbolMap.set('if', '?');
    this.symbolMap.set('else', ':');
    this.symbolMap.set('for', '⟲');
    this.symbolMap.set('while', '⟳');

    // Common phrases
    this.symbolMap.set('analyze', '🔍');
    this.symbolMap.set('generate', '⚙');
    this.symbolMap.set('optimize', '⚡');
    this.symbolMap.set('build', '🔨');
    this.symbolMap.set('test', '🧪');
    this.symbolMap.set('deploy', '🚀');

    // Task decomposition
    this.symbolMap.set('Break this problem into three independent micro-tasks', '⊕3⊗→μ');
    this.symbolMap.set('Analyze the provided code and identify logical errors', '🔍⟨code⟩→⚠');
    this.symbolMap.set('Generate a function that', '⨍✚⟨');
    this.symbolMap.set('Optimize the following for performance', '⚡⟨');
    this.symbolMap.set('Create a new', '✚⟨');
    this.symbolMap.set('Update the existing', '↻⟨');

    // Build reverse map
    for (const [pattern, symbol] of this.symbolMap.entries()) {
      this.reverseMap.set(symbol, pattern);
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
