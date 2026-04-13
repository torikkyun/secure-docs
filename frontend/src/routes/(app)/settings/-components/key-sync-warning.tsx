import { useState, useEffect } from 'react'
import { getUserKeys } from '@/lib/crypto'
import { RecoverKeysModal } from './recover-keys-modal'
import { useQuery } from '@tanstack/react-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { getCurrentUserFn } from '@/api/user/functions'

export function KeySyncWarning() {
  const [showModal, setShowModal] = useState(false)
  const [isSynced, setIsSynced] = useState(true)
  const [serverPublicKey, setServerPublicKey] = useState('')

  // Get current user with public key
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserFn,
  })

  useEffect(() => {
    if (!userData?.publicKey) return

    const userKeys = getUserKeys()
    const localPublicKey = userKeys?.publicKey
    const localEncryptedPrivateKey = userKeys?.encryptedPrivateKey

    const serverPubKey = userData.publicKey

    // Check if keys are synced
    // Show warning if:
    // 1. No keys in localStorage at all
    // 2. Missing public key or encrypted private key
    // 3. Public key doesn't match server
    const needsRecovery =
      !userKeys ||
      !localPublicKey ||
      !localEncryptedPrivateKey ||
      localPublicKey !== serverPubKey

    if (needsRecovery) {
      setIsSynced(false)
      setServerPublicKey(serverPubKey)
    } else {
      setIsSynced(true)
    }
  }, [userData])

  if (isSynced) return null

  return (
    <>
      <Alert
        variant="destructive"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-0"
      >
        <div className="flex gap-5 items-center">
          <AlertTriangle className="h-8 w-8" />
          <div className="space-y-1">
            <AlertTitle>Cảnh báo: Khóa không đồng bộ</AlertTitle>
            <AlertDescription>
              Khóa công khai của bạn không khớp với server. Vui lòng khôi phục
              khóa từ Mnemonic để tiếp tục sử dụng tính năng mã hóa.
            </AlertDescription>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setShowModal(true)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Khôi phục ngay
        </Button>
      </Alert>

      <RecoverKeysModal
        open={showModal}
        onOpenChange={setShowModal}
        serverPublicKey={serverPublicKey}
      />
    </>
  )
}
