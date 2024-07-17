export interface IClipboardManager {
  id: number
  data: string | null
  type: TypeClipboardHistory
  attachment_path: string | null
  created_at: string
  updated_at: string
}
