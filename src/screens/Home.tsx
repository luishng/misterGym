import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { HStack, Heading, Text, VStack, useToast } from "@gluestack-ui/themed";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import { HomeHeader } from "@components/HomeHeader";
import { Group } from "@components/Group";
import { ExerciseCard } from "@components/ExerciseCard";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { ToastMessage } from "@components/ToastMessage";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

export function Home() {
  const [exercises, setExercices] = useState<ExerciseDTO[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [groupSelected, setGroupSelected] = useState("antebraço")
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const toast = useToast()

  function handleOpenExerciseDetails(exerciseId: string) {
    navigation.navigate("exercise", { exerciseId })
  }

  async function fetchGroups() {
    try {
      const response = await api.get('/groups')
      setGroups(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar os grupos musculares.'

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

  async function fetchExercisesByGroup() {
    try {
      setIsLoading(true)
      const response = await api.get(`/exercises/bygroup/${groupSelected}`)
      setExercices(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar os exercícios.'

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

  useEffect(() => {
    fetchGroups()
  }, [])

  useFocusEffect(useCallback(() => {
    fetchExercisesByGroup();
  }, [groupSelected]))

  return (
    <VStack flex={1}>
      <HomeHeader />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 32 }}
        style={{
          marginVertical: 40,
          maxHeight: 44,
          minHeight: 44
        }}
        data={groups}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Group
            name={item}
            isActive={groupSelected.toLowerCase() === item.toLowerCase()}
            onPress={() => setGroupSelected(item)}
          />
        )}
      />

      {
        isLoading ?
          <Loading />
          :
          <VStack px="$8" flex={1}>
            <HStack justifyContent="space-between" mb="$5" alignItems="center">
              <Heading color="$gray200" fontSize="$md">
                Exercícios
              </Heading>

              <Text color="$gray200" fontSize="$sm" fontFamily="$body">
                {exercises.length}
              </Text>
            </HStack>

            <FlatList
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              data={exercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ExerciseCard data={item} onPress={() => handleOpenExerciseDetails(item.id)} />
              )}
            />
          </VStack>
      }
    </VStack>
  )
}