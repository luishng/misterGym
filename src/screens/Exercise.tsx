import { HStack, Heading, Icon, Text, VStack, Image, Box, useToast } from "@gluestack-ui/themed";
import { ScrollView, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import BodySvg from '@assets/body.svg'
import SeriesSvg from '@assets/series.svg'
import RepetitionsSvg from '@assets/repetitions.svg'
import { Button } from "@components/Button";
import { AppError } from "@utils/AppError";
import { ToastMessage } from "@components/ToastMessage";
import { api } from "@services/api";
import { useEffect, useState } from "react";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

type RouteParamsProps = {
  exerciseId: string
}

export function Exercise() {
  const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO)
  const [isLoading, setIsLoading] = useState(true);
  const [sendingRegister, setSendingRegister] = useState(false);

  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const route = useRoute()
  const toast = useToast()

  const { exerciseId } = route.params as RouteParamsProps;

  function handleGoBack() {
    navigation.goBack()
  }

  async function fetchExerciseDetails() {
    try {
      setIsLoading(true)
      const response = await api.get(`/exercises/${exerciseId}`)
      setExercise(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar os detalhes do exercício.'

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
      setIsLoading(false)
    }
  }

  async function handleExerciseHistoryResgister() {
    try {
      setSendingRegister(true)

      await api.post('/history', { exercise_id: exerciseId })

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action='success'
            title='Parabéns! Exercício registrado no seu histórico.'
            onClose={() => toast.close(id)}
          />
        )
      })

      navigation.navigate('history')

    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar os detalhes do exercício.'

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
      setSendingRegister(false)
    }
  }

  useEffect(() => {
    fetchExerciseDetails()
  }, [exerciseId])

  return (
    <VStack flex={1}>
      <VStack px="$8" bg="$gray600" pt="$12">
        <TouchableOpacity onPress={handleGoBack}>
          <Icon as={ArrowLeft} color="$green500" size="xl" />
        </TouchableOpacity>

        <HStack justifyContent="space-between" alignItems="center" mt="$4" mb="$8">
          <Heading color="$gray100" fontSize="$lg" fontFamily="$heading" flexShrink={1}>{exercise.name}</Heading>

          <HStack alignItems="center">
            <BodySvg />
            <Text color="$gray200" ml="$1" textTransform="capitalize">{exercise.group}</Text>
          </HStack>
        </HStack>
      </VStack>

      {isLoading ?
        <Loading /> :
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 32
          }}
        >
          <VStack p="$8" >
            <Box mb="$3" rounded="$lg" overflow="hidden">
              <Image
                source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
                alt="Exercício"
                resizeMode="cover"
                w="$full"
                h="$80"
              />
            </Box>

            <Box bg="$gray600" px="$4" py="$4" rounded="$md">
              <HStack alignItems="center" justifyContent="space-around" mb="$6" mt="$5">
                <HStack>
                  <SeriesSvg />
                  <Text color="$gray200" ml="$2">{exercise.series} séries</Text>
                </HStack>
                <HStack>
                  <RepetitionsSvg />
                  <Text color="$gray200" ml="$2">{exercise.repetitions} repetições</Text>
                </HStack>
              </HStack>

              <Button
                title="Marcar como realizado"
                isLoading={sendingRegister}
                onPress={handleExerciseHistoryResgister}
              />
            </Box>
          </VStack>
        </ScrollView>}
    </VStack>
  )
}