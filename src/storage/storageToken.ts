import AsyncStorage from "@react-native-async-storage/async-storage";

import { TOKEN_STORAGE } from '@storage/storageConfig'

type storageAuthTokenProps = {
  token: string
  refresh_token: string
}

export async function storageTokenSave({ token, refresh_token }: storageAuthTokenProps) {
  await AsyncStorage.setItem(TOKEN_STORAGE, JSON.stringify({ token, refresh_token }))
}

export async function storageTokenGet() {
  const response = await AsyncStorage.getItem(TOKEN_STORAGE)

  const { token, refresh_token }: storageAuthTokenProps = response ? JSON.parse(response) : {}

  return { token, refresh_token }
}

export async function storageTokenRemove() {
  await AsyncStorage.removeItem(TOKEN_STORAGE)
}