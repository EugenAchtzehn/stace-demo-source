export interface ManagedLayer {
  id: number;
  name: string;
  type: string;
  opacity?: number;
  subType?: string;
  [key: string]: any;
}

export interface LayerControlPayload {
  id: number;
  opacity: number;
  visible?: boolean;
}
