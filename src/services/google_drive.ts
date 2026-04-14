import pb from '@/lib/pocketbase/client'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  webViewLink: string
  iconLink?: string
  isFolder: boolean
}

export const listDriveFiles = async (parentId: string = 'root'): Promise<DriveFile[]> => {
  const res = await pb.send('/backend/v1/google-drive-list', {
    method: 'POST',
    body: JSON.stringify({ parent_id: parentId }),
  })
  return res.files || []
}

export const createDriveFolder = async (name: string, parentId: string = 'root') => {
  return pb.send('/backend/v1/google-drive-manage', {
    method: 'POST',
    body: JSON.stringify({ action: 'create_folder', name, parent_id: parentId }),
  })
}

export const renameDriveFile = async (fileId: string, name: string) => {
  return pb.send('/backend/v1/google-drive-manage', {
    method: 'POST',
    body: JSON.stringify({ action: 'rename', file_id: fileId, name }),
  })
}

export const createClientStructure = async (clientName: string, parentId: string = 'root') => {
  return pb.send('/backend/v1/google-drive-manage', {
    method: 'POST',
    body: JSON.stringify({
      action: 'create_structure',
      client_name: clientName,
      parent_id: parentId,
    }),
  })
}
