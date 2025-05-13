// @summary Component for rider application form
// @author [Tu nombre]

<script>
import { useI18n } from 'vue-i18n'
import { RiderService } from '../services/rider.service'

export default {
  name: 'rider-application',
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      loading: false,
      rider: {
        location: '',
        genre: '',
        paymentMethod: '',
        documents: []
      },
      locationOptions: [
        { label: this.t('rider.application.options.locations.lima'), value: 'lima' },
        { label: this.t('rider.application.options.locations.callao'), value: 'callao' }
      ],
      genreOptions: [
        { label: this.t('rider.application.options.genres.M'), value: 'M' },
        { label: this.t('rider.application.options.genres.F'), value: 'F' },
        { label: this.t('rider.application.options.genres.O'), value: 'O' }
      ],
      paymentOptions: [
        { label: this.t('rider.application.options.payments.cash'), value: 'cash' },
        { label: this.t('rider.application.options.payments.transfer'), value: 'transfer' }
      ]
    }
  },
  methods: {
    async handleSubmit() {
      try {
        this.loading = true
        const riderService = new RiderService()
        const result = await riderService.createRiderApplication(this.rider)
        
        this.$toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.t('rider.application.success'),
          life: 3000
        })

        // Redirigir a la página de estado
        this.$router.push(`/application-status/${result.id}`)
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: this.t('rider.application.error'),
          life: 3000
        })
      } finally {
        this.loading = false
      }
    },
    async handleFileUpload(event) {
      const file = event.files[0]
      if (!file) return

      try {
        const formData = new FormData()
        formData.append('document', file)
        
        this.loading = true
        const riderService = new RiderService()
        await riderService.uploadRiderDocument(this.rider.id, formData)
        
        this.$toast.add({
          severity: 'success',
          summary: this.t('common.success'),
          detail: this.t('rider.application.documentSuccess'),
          life: 3000
        })
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: this.t('common.error'),
          detail: this.t('rider.application.documentError'),
          life: 3000
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <div class="rider-application p-4">
    <pv-card>
      <template #title>
        <h1 class="text-2xl font-bold mb-4">{{ t('rider.application.title') }}</h1>
      </template>
      
      <template #content>
        <form @submit.prevent="handleSubmit" class="flex flex-column gap-4">
          <!-- Ubicación -->
          <div class="field">
            <label for="location" class="block mb-2">{{ t('rider.application.location') }}</label>
            <pv-select-button
              id="location"
              v-model="rider.location"
              :options="locationOptions"
              optionLabel="label"
              optionValue="value"
              :aria-label="t('rider.application.location')"
              class="w-full"
            />
          </div>

          <!-- Género -->
          <div class="field">
            <label for="genre" class="block mb-2">{{ t('rider.application.genre') }}</label>
            <pv-select-button
              id="genre"
              v-model="rider.genre"
              :options="genreOptions"
              optionLabel="label"
              optionValue="value"
              :aria-label="t('rider.application.genre')"
              class="w-full"
            />
          </div>

          <!-- Método de pago -->
          <div class="field">
            <label for="payment" class="block mb-2">{{ t('rider.application.paymentMethod') }}</label>
            <pv-select-button
              id="payment"
              v-model="rider.paymentMethod"
              :options="paymentOptions"
              optionLabel="label"
              optionValue="value"
              :aria-label="t('rider.application.paymentMethod')"
              class="w-full"
            />
          </div>

          <!-- Subir documentos -->
          <div class="field">
            <label for="document" class="block mb-2">{{ t('rider.application.document') }}</label>
            <pv-file-upload
              id="document"
              mode="basic"
              :auto="true"
              accept="application/pdf,application/msword"
              :maxFileSize="10000000"
              @upload="handleFileUpload"
              :disabled="loading"
              :chooseLabel="t('common.add')"
              class="w-full"
            />
            <small class="text-gray-500">{{ t('rider.application.documentHelp') }}</small>
          </div>

          <pv-button
            type="submit"
            :label="t('rider.application.submit')"
            :loading="loading"
            class="w-full"
            :aria-label="t('rider.application.submit')"
          />
        </form>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.rider-application {
  max-width: 800px;
  margin: 0 auto;
}

:deep(.p-selectbutton) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

:deep(.p-selectbutton .p-button) {
  flex: 1;
}

@media (max-width: 640px) {
  :deep(.p-selectbutton .p-button) {
    flex: 0 0 100%;
  }
}
</style> 