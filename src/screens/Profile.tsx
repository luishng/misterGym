import { ScrollView, TouchableOpacity } from 'react-native'
import { useState } from 'react';
import { Center, Heading, Text, VStack, useToast } from "@gluestack-ui/themed";

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system';

import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { ToastMessage } from '@components/ToastMessage';

export function Profile() {
  const [userLocalPhoto, setUserLocalPhoto] = useState('https://github.com/luishng.png');
  const toast = useToast()

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

        setUserLocalPhoto(photoURI)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt="$6" px="$10">
          <UserPhoto source={{ uri: userLocalPhoto }} alt="foto do usuário" size='xl' />
          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color="$green500" fontSize="$md" fontFamily="$heading" mt="$2" mb="$8">Alterar foto</Text>
          </TouchableOpacity>

          <Center w="$full" gap="$4">
            <Input placeholder='Nome' bg="$gray600" />
            <Input placeholder='E-mail' value="luishng@gmail.com" bg="$gray600" isReadOnly />
          </Center>

          <Heading alignSelf='flex-start' fontFamily='$heading' color="$gray200" fontSize="$md" mb="$2" mt="$12" >
            Alterar Senha
          </Heading>

          <Center w="$full" gap="$4">
            <Input placeholder='Senha Antiga' bg="$gray600" secureTextEntry />
            <Input placeholder='Nova Senha' bg="$gray600" secureTextEntry />
            <Input placeholder='Confirme a Nova Senha' bg="$gray600" secureTextEntry />

            <Button title="Atualizar" />

          </Center>
        </Center>
      </ScrollView>
    </VStack>
  )
}