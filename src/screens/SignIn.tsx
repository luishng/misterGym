import { Controller, useForm } from 'react-hook-form'
import { VStack, Image, Center, Text, Heading, ScrollView, useToast } from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";

import { AuthNavigatorRoutesProps } from '@routes/auth.routes'

import BackgroundImg from "@assets/background.png"
import Logo from '@assets/logo.svg'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useAuth } from '@hooks/useAuth';
import { AppError } from '@utils/AppError';

import { ToastMessage } from '@components/ToastMessage';
import { useState } from 'react';

type FormDataProps = {
  email: string
  password: string
}

const signInSchema = yup.object({
  email: yup.string().required('Informe o e-mail.').email('E-mail inválido.'),
  password: yup.string().required('Informe a senha.').min(6, "A senha deve ter pelo menos 6 dígitos."),
})

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const navigation = useNavigation<AuthNavigatorRoutesProps>()
  const { signIn } = useAuth()
  const toast = useToast()

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(signInSchema)
  })

  function handleNewAccount() {
    navigation.navigate("signUp")
  }

  async function handleSingIn({ email, password }: FormDataProps) {
    try {
      setIsLoading(true)
      await signIn(email, password)
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : "Não foi possível entrar. Tente novamente mais tarde."

      setIsLoading(false);

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action='error'
            title={title}
            onClose={() => toast.close(id)}
          />
        )
      })
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1}>
        <Image
          alt="Pessoas Treinando"
          w="$full"
          h={624}
          position="absolute"
          source={BackgroundImg}
          defaultSource={BackgroundImg}
        />
        <VStack flex={1} px="$10" pb="$16">
          <Center my="$24">
            <Logo />

            <Text color="$gray100" fontSize="$sm">Treine a sua mente e seu corpo.</Text>
          </Center>

          <Center gap="$2">
            <Heading color="$gray100">Acesse a sua conta</Heading>
            <Controller
              name='email'
              control={control}
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  errorMessage={errors.email?.message}
                />
              )}
            />


            <Controller
              name='password'
              control={control}
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="Senha"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  errorMessage={errors.password?.message}
                />
              )}
            />

            <Button title="Acessar" onPress={handleSubmit(handleSingIn)} isLoading={isLoading} />
          </Center>

          <Center flex={1} justifyContent="flex-end" mt="$4" >
            <Text color="$gray100" fontSize="$sm" mb="$3" fontFamily="$body">
              Ainda não tem acesso?
            </Text>

            <Button title="Criar Conta" variant="outline" onPress={handleNewAccount} />
          </Center>
        </VStack>
      </VStack>
    </ScrollView>
  )
}