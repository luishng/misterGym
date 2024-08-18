import { HStack, Heading, Text, VStack, Icon } from "@gluestack-ui/themed";
import { LogOut } from 'lucide-react-native'

import { UserPhoto } from "./UserPhoto";

export function HomeHeader() {
  return (
    <HStack bg="$gray600" pt="$16" pb="$5" px="$8" alignItems="center" gap="$4">
      <UserPhoto w="$16" h="$16" alt="Imagem do usuário" source={{ uri: 'https://github.com/luishng.png' }} />
      <VStack flex={1}>
        <Text color="$gray100" fontSize="$sm">Olá,</Text>
        <Heading color="$gray100" fontSize="$md">Luis Henrique</Heading>
      </VStack>

      <Icon as={LogOut} color="$gray200" size="xl" />
    </HStack>
  )
}