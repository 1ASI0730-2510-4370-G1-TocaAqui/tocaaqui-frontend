<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();
const user = ref(JSON.parse(localStorage.getItem('user')));

const isPromoter = computed(() => user.value?.role === 'promotor');

const navigateTo = (path) => {
  router.push(path);
};

// Definir rutas de imágenes por defecto
const defaultVenueImage = '/images/default-venue.jpg';
const defaultArtistImage = '/images/default-artist.jpg';
</script>

<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">{{ t('evaluations.title') }}</h2>

    <div class="grid">
      <!-- Opciones para promotores -->
      <template v-if="isPromoter">
        <div class="col-12 md:col-6 lg:col-4 mb-4">
          <pv-card class="h-full">
            <template #header>
              <div class="relative">
                <img :src="defaultVenueImage" alt="Evaluar Local" class="w-full h-15rem object-cover" />
                <div class="absolute bottom-0 left-0 right-0 bg-black-alpha-50 p-3">
                  <h3 class="text-white text-xl m-0">{{ t('evaluations.venueEvaluation.title') }}</h3>
                </div>
              </div>
            </template>
            <template #content>
              <p>{{ t('evaluations.venueEvaluation.description') }}</p>
            </template>
            <template #footer>
              <div class="flex justify-content-between">
                <pv-button 
                  :label="t('evaluations.evaluate')" 
                  icon="pi pi-star" 
                  @click="navigateTo('/evaluations/venues')"
                />
                <pv-button 
                  :label="t('evaluations.viewEvaluated')" 
                  icon="pi pi-list" 
                  class="p-button-outlined" 
                  @click="navigateTo('/evaluations/venues/evaluated')"
                />
              </div>
            </template>
          </pv-card>
        </div>

        <div class="col-12 md:col-6 lg:col-4 mb-4">
          <pv-card class="h-full">
            <template #header>
              <div class="relative">
                <img :src="defaultArtistImage" alt="Evaluar Artistas" class="w-full h-15rem object-cover" />
                <div class="absolute bottom-0 left-0 right-0 bg-black-alpha-50 p-3">
                  <h3 class="text-white text-xl m-0">{{ t('evaluations.artistEvaluation.title') }}</h3>
                </div>
              </div>
            </template>
            <template #content>
              <p>{{ t('evaluations.artistEvaluation.description') }}</p>
            </template>
            <template #footer>
              <div class="flex justify-content-between">
                <pv-button 
                  :label="t('evaluations.evaluate')" 
                  icon="pi pi-star" 
                  @click="navigateTo('/evaluations/artists')"
                />
                <pv-button 
                  :label="t('evaluations.viewEvaluated')" 
                  icon="pi pi-list" 
                  class="p-button-outlined" 
                  @click="navigateTo('/evaluations/artists/evaluated')"
                />
              </div>
            </template>
          </pv-card>
        </div>
      </template>

      <!-- Opciones para músicos -->
      <template v-else>
        <div class="col-12 md:col-6 lg:col-4 mb-4">
          <pv-card class="h-full">
            <template #header>
              <div class="relative">
                <img :src="defaultVenueImage" alt="Evaluar Local" class="w-full h-15rem object-cover" />
                <div class="absolute bottom-0 left-0 right-0 bg-black-alpha-50 p-3">
                  <h3 class="text-white text-xl m-0">{{ t('evaluations.venueEvaluation.title') }}</h3>
                </div>
              </div>
            </template>
            <template #content>
              <p>{{ t('evaluations.venueEvaluation.description') }}</p>
            </template>
            <template #footer>
              <div class="flex justify-content-between">
                <pv-button 
                  :label="t('evaluations.evaluate')" 
                  icon="pi pi-star" 
                  @click="navigateTo('/evaluations/venues')"
                />
                <pv-button 
                  :label="t('evaluations.viewEvaluated')" 
                  icon="pi pi-list" 
                  class="p-button-outlined" 
                  @click="navigateTo('/evaluations/venues/evaluated')"
                />
              </div>
            </template>
          </pv-card>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.p-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.p-card-content) {
  flex-grow: 1;
}
</style> 