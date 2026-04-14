import { useState, useCallback, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from './use-auth'
import { toast } from 'sonner'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  webViewLink: string
  iconLink?: string
  isFolder: boolean
  modifiedTime?: string
}

export function useGoogleDrive() {
  const { user } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<DriveFile[]>([])

  const checkConnection = useCallback(async () => {
    if (!user) {
      setIsChecking(false)
      return
    }
    try {
      const configs = await pb
        .collection('configuracoes_usuario')
        .getFirstListItem(`user="${user.id}"`)
      setIsConnected(!!configs.google_connected)
    } catch (err) {
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }, [user])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  const listFiles = useCallback(
    async (folderId: string = 'root') => {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        const res = await pb.send('/backend/v1/google-drive-list', {
          method: 'POST',
          body: JSON.stringify({ user_id: user.id, folder_id: folderId }),
        })
        setFiles(res.files || [])
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar arquivos')
        const msg = err.message?.toLowerCase() || ''
        if (
          err.status === 401 ||
          err.status === 403 ||
          msg.includes('não conectado') ||
          msg.includes('not connected')
        ) {
          setIsConnected(false)
        }
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const createFolder = async (name: string, parentId: string = 'root') => {
    if (!user) throw new Error('Usuário não autenticado')
    await pb.send('/backend/v1/google-drive-manage', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create_folder',
        user_id: user.id,
        name,
        parent_id: parentId,
      }),
    })
  }

  const renameItem = async (fileId: string, newName: string) => {
    if (!user) throw new Error('Usuário não autenticado')
    await pb.send('/backend/v1/google-drive-manage', {
      method: 'POST',
      body: JSON.stringify({
        action: 'rename',
        user_id: user.id,
        file_id: fileId,
        new_name: newName,
      }),
    })
  }

  const moveItem = async (fileId: string, newParentId: string, oldParentId: string) => {
    if (!user) throw new Error('Usuário não autenticado')
    await pb.send('/backend/v1/google-drive-manage', {
      method: 'POST',
      body: JSON.stringify({
        action: 'move',
        user_id: user.id,
        file_id: fileId,
        new_parent_id: newParentId,
        old_parent_id: oldParentId,
      }),
    })
  }

  const createClientStructure = async (clientName: string, parentId: string = 'root') => {
    if (!user) throw new Error('Usuário não autenticado')
    await pb.send('/backend/v1/google-drive-manage', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create_structure',
        user_id: user.id,
        client_name: clientName,
        parent_id: parentId,
      }),
    })
  }

  const connectGoogle = useCallback(() => {
    if (!user) return
    const w = 500
    const h = 600
    const left = window.screen.width / 2 - w / 2
    const top = window.screen.height / 2 - h / 2
    const popup = window.open(
      `${pb.baseUrl}/backend/v1/google-auth?user_id=${user.id}`,
      'Google Auth',
      `width=${w},height=${h},top=${top},left=${left}`,
    )

    const listener = (event: MessageEvent) => {
      if (event.data === 'google_connected') {
        setIsConnected(true)
        toast.success('Google Drive conectado com sucesso!')
        if (popup) popup.close()
        window.removeEventListener('message', listener)
        listFiles('root')
      }
    }
    window.addEventListener('message', listener)
  }, [user, listFiles])

  return {
    isChecking,
    isConnected,
    loading,
    error,
    files,
    listFiles,
    createFolder,
    renameItem,
    moveItem,
    createClientStructure,
    connectGoogle,
    checkConnection,
  }
}
