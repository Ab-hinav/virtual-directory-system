export type UUID = string;
export type NodeType = "file" | "folder";
export interface VNode {
  id: string;
  name: string;
  type: NodeType;
  parent_id: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}