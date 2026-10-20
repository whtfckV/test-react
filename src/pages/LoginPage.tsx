import { Alert, Button, Center, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router'
import { greenApi } from '../api/greenApi'
import type { Credentials } from '../api/greenApi'
import { useAuthStore } from '../store/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { credentials, login } = useAuthStore()

  const form = useForm<Credentials>({
    initialValues: { idInstance: '', apiTokenInstance: '' },
    validate: {
      idInstance: (v) => (v.trim() ? null : 'Укажите idInstance'),
      apiTokenInstance: (v) => (v.trim() ? null : 'Укажите apiTokenInstance'),
    },
  })

  const mutation = useMutation({
    mutationFn: async (creds: Credentials) => {
      const { stateInstance } = await greenApi.getStateInstance(creds)
      if (stateInstance !== 'authorized') {
        throw new Error(`Инстанс не авторизован: ${stateInstance}`)
      }
    },
    onSuccess: (_, creds) => {
      login(creds)
      void navigate('/', { replace: true })
    },
  })

  if (credentials) return <Navigate to="/" replace />

  return (
    <Center h="100dvh" p="md">
      <Paper withBorder shadow="md" p="xl" w="100%" maw={400}>
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
          <Stack>
            <Title order={3} ta="center">
              Вход в Green API
            </Title>
            <TextInput label="idInstance" {...form.getInputProps('idInstance')} />
            <PasswordInput label="apiTokenInstance" {...form.getInputProps('apiTokenInstance')} />
            {mutation.error && (
              <Alert color="red" variant="light">
                {mutation.error.message}
              </Alert>
            )}
            <Button type="submit" loading={mutation.isPending} fullWidth>
              Войти
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  )
}
