/**
 * SEMANTIC COMPRESSOR - Layer 2
 *
 * Converts verbose text to compact semantic forms.
 * Maintains readability while reducing tokens.
 * Target: 40% additional savings.
 */

export class SemanticCompressor {
  /**
   * Compress text semantically
   */
  async compress(text: string): Promise<{
    compressed: string;
    savings_percent: number;
  }> {
    let compressed = text;

    // Remove redundant words
    compressed = this.removeRedundancy(compressed);

    // Convert to shorthand where possible
    compressed = this.convertToShorthand(compressed);

    // Remove unnecessary punctuation
    compressed = this.optimizePunctuation(compressed);

    const savings_percent = ((text.length - compressed.length) / text.length) * 100;

    return { compressed, savings_percent };
  }

  /**
   * Decompress back to readable form
   */
  async decompress(compressed: string): Promise<string | null> {
    // For now, semantic compression is mostly one-way
    // In production, would store metadata to reverse
    // For this implementation, we preserve meaning but not exact form
    return null; // Indicates no decompression needed
  }

  // Private helpers

  private removeRedundancy(text: string): string {
    const redundantPatterns: Array<[RegExp, string]> = [
      [/\b(please|kindly|could you)\b/gi, ''],
      [/\b(I would like|I want|I need)\s+(you to|to)/gi, ''],
      [/\b(can you|would you|will you)\b/gi, ''],
      [/\b(basically|essentially|actually|literally)\b/gi, ''],
      [/\s+/g, ' '], // Multiple spaces to single
    ];

    let result = text;
    for (const [pattern, replacement] of redundantPatterns) {
      result = result.replace(pattern, replacement);
    }

    return result.trim();
  }

  private convertToShorthand(text: string): string {
    const shorthandMap: Array<[RegExp, string]> = [
      [/\bapplication\b/gi, 'app'],
      [/\bdatabase\b/gi, 'db'],
      [/\bconfiguration\b/gi, 'config'],
      [/\benvironment\b/gi, 'env'],
      [/\brepository\b/gi, 'repo'],
      [/\bdocumentation\b/gi, 'docs'],
      [/\bspecification\b/gi, 'spec'],
      [/\bimplementation\b/gi, 'impl'],
      [/\bparameter\b/gi, 'param'],
      [/\bargument\b/gi, 'arg'],
      [/\bvariable\b/gi, 'var'],
      [/\btemporary\b/gi, 'temp'],
      [/\bmaximum\b/gi, 'max'],
      [/\bminimum\b/gi, 'min'],
      [/\baverage\b/gi, 'avg'],
      [/\bnumber\b/gi, 'num'],
      [/\bstring\b/gi, 'str'],
      [/\bboolean\b/gi, 'bool'],
    ];

    let result = text;
    for (const [pattern, replacement] of shorthandMap) {
      result = result.replace(pattern, replacement);
    }

    return result;
  }

  private optimizePunctuation(text: string): string {
    let result = text;

    // Remove trailing punctuation that doesn't add meaning
    result = result.replace(/[.!?]+\s*$/g, '');

    // Single spaces after punctuation
    result = result.replace(/([.!?,;:])\s+/g, '$1 ');

    return result;
  }
}
