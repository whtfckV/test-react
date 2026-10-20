import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router'
import { normalizePhone, phoneToChatId } from '../../lib/phone'
import { useChatsStore } from '../../store/chats'

interface Props {
  opened: boolean
  onClose: () => void
}

export function AddChatModal({ opened, onClose }: Readonly<Props>) {
  const navigate = useNavigate()
  const addChat = useChatsStore((s) => s.addChat)

  const form = useForm({
    initialValues: { phone: '' },
    validate: {
      phone: (v) => (normalizePhone(v).length >= 10 ? null : 'Введите номер в международном формате'),
    },
  })

  const handleSubmit = ({ phone }: { phone: string }) => {
    const chatId = phoneToChatId(phone)
    addChat(chatId, normalizePhone(phone))
    form.reset()
    onClose()
    void navigate(`/chat/${chatId}`)
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Новый чат" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label="Номер телефона" placeholder="79001234567" data-autofocus {...form.getInputProps('phone')} />
          <Button type="submit">Создать</Button>
        </Stack>
      </form>
    </Modal>
  )
}
