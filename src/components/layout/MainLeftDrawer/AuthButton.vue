<template>
  <q-btn v-if="!userStore.user" icon="fa fat fa-user-circle" @click="showDialog = true" />
  <q-btn v-else flat round>
    <q-avatar color="primary" size="1.715em">
      {{ getInitials(userStore.user?.full_name || '') }}
    </q-avatar>

    <q-menu anchor="bottom right" self="bottom left">
      <q-list>
        <q-item clickable v-close-popup @click="authStore.logout()">
          <q-item-section>
            {{ $t('logout') }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>

  <q-dialog v-model="showDialog">
    <q-card style="min-width: 320px">
      <q-card-section>
        <div class="text-h6">{{ $t('login') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input v-model="username" :label="$t('username')" filled autocomplete="username"
            :rules="[val => !!val || $t('username_required')]" />

          <q-input v-model="password" :label="$t('password')" type="password" filled autocomplete="current-password"
            :rules="[val => !!val || $t('password_required')]" />

          <div class="row justify-end q-gutter-sm">
            <q-btn :label="$t('cancel')" flat v-close-popup />
            <q-btn :label="$t('login')" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from 'src/stores/authStore';
import { useUserStore } from 'src/stores/userStore';
import { getInitials } from 'src/utils/Utils';

const $q = useQuasar()
const { t } = useI18n()

const authStore = useAuthStore()
const userStore = useUserStore()

const showDialog = ref(false)

const username = ref('')
const password = ref('')

async function onSubmit() {
  try {
    await authStore.login(username.value, password.value)

    showDialog.value = false
    password.value = ''
  } catch (err) {
    console.error('Login failed', err)
    $q.notify({
      color: 'negative',
      position: 'top-right',
      message: t('login_failed'),
      icon: 'report_problem'
    })
  }
}
</script>
