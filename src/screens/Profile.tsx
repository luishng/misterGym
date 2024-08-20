import { ScrollView, TouchableOpacity } from 'react-native'
import { useState } from 'react';
import { Center, Heading, Text, VStack, useToast } from "@gluestack-ui/themed";
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system';

import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';
import { AppError } from '@utils/AppError';

import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { ToastMessage } from '@components/ToastMessage';

import userPhotoDefault from '@assets/userPhotoDefault.png'

type FormDataProps = {
  name: string
  email?: string | undefined
  password?: string | null | undefined
  old_password?: string | undefined
  confirm_password?: string | null | undefined
}

const profileSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  email: yup.string(),
  old_password: yup.string(),
  password: yup.string().min(6, 'A senha deve ter pelo menos 6 dígitos').nullable().transform((value) => !!value ? value : null),
  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => !!value ? value : null)
    .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere')
    .when('password', {
      is: (Field: any) => Field,
      then: (schema) => schema.nullable().required('Informe a confimação da senha').transform((value) => !!value ? value : null)
    }),
})

export function Profile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [photoIsLoading, setPhotoIsLoading] = useState(false);

  const toast = useToast()
  const { user, updateUserProfile } = useAuth()
  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email
    },
    resolver: yupResolver(profileSchema)
  })

  async function handleUserPhotoSelect() {
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })

      if (photoSelected.canceled) {
        return;
      }

      const photoURI = photoSelected.assets[0].uri

      if (photoURI) {
        const photoInfo = await FileSystem.getInfoAsync(photoURI) as { size: number }

        if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 5) {
          return toast.show({
            placement: "top",
            render: ({ id }) => (
              <ToastMessage
                id={id}
                action='error'
                title="Essa imagem é muito grande. Escolhar um de até 5MB."
                onClose={() => toast.close(id)}
              />
            )
          })
        }

        const fileExtension = photoURI.split('.').pop()

        const photoFile = {
          name: `${user.name}.${fileExtension}`,
          uri: photoURI,
          type: `image/${fileExtension}`
        } as any;

        const userPhotoUploadForm = new FormData()
        userPhotoUploadForm.append('avatar', photoFile)

        const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const userUpdated = user;
        userUpdated.avatar = avatarUpdatedResponse.data.avatar

        updateUserProfile(userUpdated)

        toast.show({
          placement: "top",
          render: ({ id }) => (
            <ToastMessage
              id={id}
              action='success'
              title="Foto atualizada com sucesso!"
              onClose={() => toast.close(id)}
            />
          )
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsUpdating(true)

      const userUpdated = user;
      userUpdated.name = data.name

      await api.put('/users', data)

      updateUserProfile(userUpdated)

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action='success'
            title="Perfil atualizado com sucesso!"
            onClose={() => toast.close(id)}
          />
        )
      })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível atualizar os dados. Tente nomante mais tarde.'

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
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt="$6" px="$10">
          <UserPhoto source={
            user.avatar ?
              { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } :
              userPhotoDefault
          } alt="foto do usuário" size='xl' />
          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color="$green500" fontSize="$md" fontFamily="$heading" mt="$2" mb="$8">Alterar foto</Text>
          </TouchableOpacity>

          <Center w="$full" gap="$4">
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <Input placeholder='Nome' bg="$gray600" value={value} onChangeText={onChange} errorMessage={errors.name?.message} />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder='E-mail'
                  bg="$gray600"
                  isReadOnly
                  value={value}
                  onChangeText={onChange} />
              )}
            />

          </Center>

          <Heading alignSelf='flex-start' fontFamily='$heading' color="$gray200" fontSize="$md" mb="$2" mt="$12" >
            Alterar Senha
          </Heading>

          <Center w="$full" gap="$4">
            <Controller
              control={control}
              name="old_password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder='Senha Antiga'
                  bg="$gray600"
                  secureTextEntry
                  onChangeText={onChange} />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder='Nova Senha'
                  bg="$gray600"
                  secureTextEntry
                  errorMessage={errors.password?.message}
                  onChangeText={onChange} />
              )}
            />
            <Controller
              control={control}
              name="confirm_password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder='Confirme a Nova Senha'
                  bg="$gray600"
                  secureTextEntry
                  errorMessage={errors.confirm_password?.message}
                  onChangeText={onChange} />
              )}
            />

            <Button mt="$4" title="Atualizar" isLoading={isUpdating} onPress={handleSubmit(handleProfileUpdate)} />
          </Center>
        </Center>
      </ScrollView>
    </VStack>
  )
}