export const LIMIT_SIZE = 1000

export interface IClipboardManager {
  id: string
  content: string
  type: 'text' | 'image'
  attachment_path: string | null
  app_icon: string | null
  app_name: string | null
  created_at?: string | null
}
