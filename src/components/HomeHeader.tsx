import { HStack, Heading, Text, VStack, Icon } from "@gluestack-ui/themed";
import { LogOut } from 'lucide-react-native'

import userPhotoDefault from '@assets/userPhotoDefault.png'

import { UserPhoto } from "./UserPhoto";
import { useAuth } from "@hooks/useAuth";
import { TouchableOpacity } from "react-native";
import { api } from "@services/api";

export function HomeHeader() {
  const { user, signOut } = useAuth()

  console.log(user)

  return (
    <HStack bg="$gray600" pt="$16" pb="$5" px="$8" alignItems="center" gap="$4">
      <UserPhoto
        w="$16"
        h="$16"
        alt="Imagem do usuário"
        source={
          user.avatar ?
            { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } :
            userPhotoDefault
        }
      />
      <VStack flex={1}>
        <Text color="$gray100" fontSize="$sm">Olá,</Text>
        <Heading color="$gray100" fontSize="$md">{user.name}</Heading>
      </VStack>

      <TouchableOpacity onPress={signOut}>
        <Icon as={LogOut} color="$gray200" size="xl" />
      </TouchableOpacity>
    </HStack>
  )
}