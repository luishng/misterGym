import { ScrollView, TouchableOpacity } from 'react-native'
import { Center, Heading, Text, VStack } from "@gluestack-ui/themed";

import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

export function Profile() {
  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt="$6" px="$10">
          <UserPhoto source={{ uri: "https://github.com/luishng.png" }} alt="foto do usuário" size='xl' />
          <TouchableOpacity >
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