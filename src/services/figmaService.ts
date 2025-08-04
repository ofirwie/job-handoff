import { supabase } from '@/lib/supabase';

interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }>;
  strokes?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }>;
  effects?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    offset?: {
      x: number;
      y: number;
    };
    radius?: number;
  }>;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  constraints?: {
    vertical: string;
    horizontal: string;
  };
  layoutAlign?: string;
  layoutGrow?: number;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;
  clipsContent?: boolean;
  background?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }>;
  backgroundColor?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  exportSettings?: Array<{
    format: string;
    suffix?: string;
    constraint?: {
      type: string;
      value: number;
    };
  }>;
}

interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  remote_component_id: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    handle: string;
    img_url: string;
  };
  containing_frame: {
    name: string;
    node_id: string;
  };
}

interface FigmaDesignToken {
  name: string;
  type: 'color' | 'typography' | 'spacing' | 'border' | 'shadow';
  value: string | number;
  description?: string;
}

class FigmaService {
  private readonly baseUrl = 'https://api.figma.com/v1';
  private readonly fileKey: string;
  private readonly accessToken: string;

  constructor(fileKey: string, accessToken?: string) {
    this.fileKey = fileKey;
    // Use import.meta.env for Vite environment variables (browser-compatible)
    this.accessToken = accessToken || import.meta.env.VITE_FIGMA_ACCESS_TOKEN || '';
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-Figma-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getFile(): Promise<{ document: FigmaNode; components: Record<string, FigmaComponent> }> {
    return this.makeRequest(`/files/${this.fileKey}`);
  }

  async getFileNodes(nodeIds: string[]): Promise<{ nodes: Record<string, { document: FigmaNode }> }> {
    const nodeIdsParam = nodeIds.join(',');
    return this.makeRequest(`/files/${this.fileKey}/nodes?ids=${nodeIdsParam}`);
  }

  async getFileImages(nodeIds: string[], format: string = 'png', scale: number = 1): Promise<{ images: Record<string, string> }> {
    const nodeIdsParam = nodeIds.join(',');
    return this.makeRequest(`/images/${this.fileKey}?ids=${nodeIdsParam}&format=${format}&scale=${scale}`);
  }

  async getTeamComponents(teamId: string): Promise<{ meta: { components: FigmaComponent[] } }> {
    return this.makeRequest(`/teams/${teamId}/components`);
  }

  private rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${a < 1 ? toHex(a) : ''}`;
  }

  private extractDesignTokens(node: FigmaNode, tokens: FigmaDesignToken[] = []): FigmaDesignToken[] {
    // Extract color tokens
    if (node.fills && node.fills.length > 0) {
      node.fills.forEach((fill, index) => {
        if (fill.type === 'SOLID' && fill.color) {
          const { r, g, b, a = 1 } = fill.color;
          tokens.push({
            name: `${node.name}-fill-${index}`,
            type: 'color',
            value: this.rgbaToHex(r, g, b, a),
            description: `Fill color from ${node.name}`,
          });
        }
      });
    }

    // Extract stroke tokens
    if (node.strokes && node.strokes.length > 0) {
      node.strokes.forEach((stroke, index) => {
        if (stroke.type === 'SOLID' && stroke.color) {
          const { r, g, b, a = 1 } = stroke.color;
          tokens.push({
            name: `${node.name}-stroke-${index}`,
            type: 'color',
            value: this.rgbaToHex(r, g, b, a),
            description: `Stroke color from ${node.name}`,
          });
        }
      });
    }

    // Extract border radius tokens
    if (node.cornerRadius !== undefined) {
      tokens.push({
        name: `${node.name}-border-radius`,
        type: 'border',
        value: node.cornerRadius,
        description: `Border radius from ${node.name}`,
      });
    }

    // Extract shadow tokens
    if (node.effects && node.effects.length > 0) {
      node.effects.forEach((effect, index) => {
        if (effect.type === 'DROP_SHADOW' && effect.color) {
          const { r, g, b, a = 1 } = effect.color;
          const shadowValue = `${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 0}px ${this.rgbaToHex(r, g, b, a)}`;
          tokens.push({
            name: `${node.name}-shadow-${index}`,
            type: 'shadow',
            value: shadowValue,
            description: `Shadow from ${node.name}`,
          });
        }
      });
    }

    // Recursively extract from children
    if (node.children) {
      node.children.forEach(child => {
        this.extractDesignTokens(child, tokens);
      });
    }

    return tokens;
  }

  async generateDesignTokens(): Promise<FigmaDesignToken[]> {
    try {
      const fileData = await this.getFile();
      return this.extractDesignTokens(fileData.document);
    } catch (error) {
      console.error('Error generating design tokens:', error);
      return [];
    }
  }

  async exportComponents(nodeIds: string[]): Promise<string[]> {
    try {
      const imagesData = await this.getFileImages(nodeIds, 'svg', 1);
      return Object.values(imagesData.images);
    } catch (error) {
      console.error('Error exporting components:', error);
      return [];
    }
  }

  async syncDesignTokensToSupabase(tokens: FigmaDesignToken[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('design_tokens')
        .upsert(tokens.map(token => ({
          name: token.name,
          type: token.type,
          value: token.value,
          description: token.description,
          source: 'figma',
          file_key: this.fileKey,
          updated_at: new Date().toISOString(),
        })));

      if (error) {
        throw new Error(`Error syncing to Supabase: ${error.message}`);
      }
    } catch (error) {
      console.error('Error syncing design tokens to database:', error);
      throw error;
    }
  }

  async getStoredDesignTokens(): Promise<FigmaDesignToken[]> {
    try {
      const { data, error } = await supabase
        .from('design_tokens')
        .select('*')
        .eq('file_key', this.fileKey)
        .eq('source', 'figma');

      if (error) {
        throw new Error(`Error fetching from Supabase: ${error.message}`);
      }

      return (data || []).map(row => ({
        name: row.name,
        type: row.type,
        value: row.value,
        description: row.description,
      }));
    } catch (error) {
      console.error('Error fetching stored design tokens:', error);
      return [];
    }
  }

  // Generate CSS custom properties from design tokens
  generateCSSCustomProperties(tokens: FigmaDesignToken[]): string {
    let css = ':root {\n';
    
    tokens.forEach(token => {
      const customPropertyName = `--figma-${token.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      css += `  ${customPropertyName}: ${token.value};\n`;
    });
    
    css += '}\n';
    return css;
  }

  // Generate Tailwind config from design tokens
  generateTailwindConfig(tokens: FigmaDesignToken[]): object {
    const config: any = {
      theme: {
        extend: {
          colors: {},
          spacing: {},
          borderRadius: {},
          boxShadow: {},
        },
      },
    };

    tokens.forEach(token => {
      const key = token.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      switch (token.type) {
        case 'color':
          config.theme.extend.colors[key] = token.value;
          break;
        case 'spacing':
          config.theme.extend.spacing[key] = `${token.value}px`;
          break;
        case 'border':
          config.theme.extend.borderRadius[key] = `${token.value}px`;
          break;
        case 'shadow':
          config.theme.extend.boxShadow[key] = token.value;
          break;
      }
    });

    return config;
  }
}

// Export utility function to create Figma service instance
export const createFigmaService = (fileKey: string, accessToken?: string): FigmaService => {
  return new FigmaService(fileKey, accessToken);
};

// Export lazy Figma service getter for your specific file (prevents module load errors)
export const getOfirFigmaService = (accessToken?: string): FigmaService => {
  return createFigmaService('kLjdmXN2Mf1AxU55cdPqQz', accessToken);
};

export default FigmaService;
export type { FigmaDesignToken, FigmaComponent, FigmaNode };