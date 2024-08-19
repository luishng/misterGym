import { HStack, Heading, Text, VStack, Icon } from "@gluestack-ui/themed";
import { LogOut } from 'lucide-react-native'

import userPhotoDefault from '@assets/userPhotoDefault.png'

import { UserPhoto } from "./UserPhoto";
import { useAuth } from "@hooks/useAuth";

export function HomeHeader() {
  const { user } = useAuth()

  return (
    <HStack bg="$gray600" pt="$16" pb="$5" px="$8" alignItems="center" gap="$4">
      <UserPhoto
        w="$16"
        h="$16"
        alt="Imagem do usuário"
        source={user.avatar ? { uri: user.avatar } : userPhotoDefault}
      />
      <VStack flex={1}>
        <Text color="$gray100" fontSize="$sm">Olá,</Text>
        <Heading color="$gray100" fontSize="$md">{user.name}</Heading>
      </VStack>

      <Icon as={LogOut} color="$gray200" size="xl" />
    </HStack>
  )
}