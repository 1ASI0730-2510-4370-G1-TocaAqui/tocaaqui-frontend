<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { EventApplicationService } from '../services/event-application.service';
import { EventApplication } from '../model/event-application.model';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const toast = useToast();
const eventApplicationService = new EventApplicationService();
const router = useRouter();

// User data
const user = ref(null);
const userId = ref(null);

// UI state
const loading = ref(false);
const submitted = ref(false);
const showPreview = ref(false);
const showForm = ref(false);
const promoterEvents = ref([]);
const loadingEvents = ref(true);

// Form data
const event = reactive({
  promoterId: null,
  name: '',
  date: '',
  time: '',
  location: '',
  imageUrl: '',
  status: 'pending',
  publishDate: new Date().toISOString().split('T')[0], // Today's date
  soundcheckDate: '',
  soundcheckTime: '',
  capacity: '',
  availableTickets: '',
  adminName: '',
  adminId: '',
  adminContact: '',
  requirements: '',
  description: '',
  payment: '',
  duration: null,
  genre: '',
  equipment: ''
});

// Form validation
const validationErrors = reactive({
  name: false,
  date: false,
  time: false,
  location: false,
  soundcheckDate: false,
  soundcheckTime: false,
  capacity: false,
  requirements: false,
  description: false,
  payment: false,
  duration: false,
  genre: false,
  equipment: false,
  adminContact: false
});

// Genre options
const genreOptions = [
  'Rock', 'Pop', 'Jazz', 'Electrónica', 'Hip Hop', 'Reggaeton', 
  'Salsa', 'Cumbia', 'Clásica', 'Folk', 'Metal', 'Blues', 'Otro'
];

// Image upload
const imageFile = ref(null);
const uploadedImage = ref(null);

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Computed properties for preview
const formattedDate = computed(() => formatDate(event.date));
const formattedSoundcheckDate = computed(() => formatDate(event.soundcheckDate));
const displayImageUrl = computed(() => uploadedImage.value || event.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14');

// Load user data and promoter events
onMounted(async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
      userId.value = user.value.id;
      
      // Set promoter ID and admin info
      event.promoterId = user.value.id;
      event.adminId = user.value.id;
      event.adminName = user.value.name;
      
      // Load promoter events
      await fetchPromoterEvents();
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('promoter.dashboard.events.fetchError'),
      life: 3000
    });
  }
});

// Fetch events created by this promoter
const fetchPromoterEvents = async () => {
  try {
    loadingEvents.value = true;
    const allEvents = await eventApplicationService.getAll();
    promoterEvents.value = allEvents.filter(e => e.promoterId === userId.value);
  } catch (error) {
    console.error('Error fetching promoter events:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('promoter.dashboard.events.fetchError') || 'Error al cargar los eventos',
      life: 3000
    });
  } finally {
    loadingEvents.value = false;
  }
};

// Show form to create a new event
const showCreateForm = () => {
  showForm.value = true;
  resetForm();
};

// Hide form
const hideForm = () => {
  showForm.value = false;
  showPreview.value = false;
  resetForm();
};

// Reset form
const resetForm = () => {
  Object.keys(event).forEach(key => {
    if (key !== 'promoterId' && key !== 'adminId' && key !== 'adminName' && key !== 'status') {
      event[key] = key === 'publishDate' ? new Date().toISOString().split('T')[0] : '';
    }
  });
  submitted.value = false;
  uploadedImage.value = null;
  imageFile.value = null;
};

// Validate form
const validateForm = () => {
  let isValid = true;
  
  // Reset validation errors
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = false;
  });
  
  // Required fields validation
  const requiredFields = [
    'name', 'date', 'time', 'location', 'soundcheckDate', 
    'soundcheckTime', 'capacity', 'requirements', 'description', 
    'payment', 'duration', 'genre', 'equipment', 'adminContact'
  ];
  
  requiredFields.forEach(field => {
    if (!event[field]) {
      validationErrors[field] = true;
      isValid = false;
    }
  });
  
  // Numeric fields validation
  if (event.capacity && (isNaN(event.capacity) || event.capacity <= 0)) {
    validationErrors.capacity = true;
    isValid = false;
  }
  
  if (event.duration && (isNaN(event.duration) || event.duration <= 0)) {
    validationErrors.duration = true;
    isValid = false;
  }
  
  // Date validation
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date);
  const soundcheckDate = new Date(event.soundcheckDate);
  
  if (eventDate < currentDate) {
    validationErrors.date = true;
    isValid = false;
  }
  
  if (soundcheckDate > eventDate) {
    validationErrors.soundcheckDate = true;
    isValid = false;
  }
  
  return isValid;
};

// Calculate available tickets based on capacity
const updateAvailableTickets = () => {
  if (event.capacity) {
    event.availableTickets = event.capacity;
  }
};

// Handle image upload
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('applicationDetail.imageUpload.invalidType'),
        life: 3000
      });
      return;
    }

    // Validar el tamaño del archivo (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('applicationDetail.imageUpload.tooLarge'),
        life: 3000
      });
      return;
    }

    imageFile.value = file;
    
    // Crear URL temporal para previsualización
    if (uploadedImage.value) {
      URL.revokeObjectURL(uploadedImage.value);
    }
    uploadedImage.value = URL.createObjectURL(file);
  }
};

// Preview event before submitting
const previewEvent = () => {
  submitted.value = true;
  
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('promoter.dashboard.createEvent.validationError') || 'Por favor, complete todos los campos requeridos',
      life: 3000
    });
    return;
  }
  
  // Set available tickets if not set
  if (!event.availableTickets) {
    updateAvailableTickets();
  }
  
  showPreview.value = true;
};

// Submit form
const submitForm = async () => {
  loading.value = true;
  
  try {
    // Preparar los datos del evento
    const eventData = new EventApplication({
      ...event,
      imageFile: imageFile.value // Agregar el archivo de imagen para que el servicio lo procese
    });
    
    // Crear evento usando el servicio
    await eventApplicationService.create(eventData);
    
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('promoter.dashboard.createEvent.success') || 'Evento creado exitosamente',
      life: 3000
    });
    
    // Reset form and UI state
    resetForm();
    showForm.value = false;
    showPreview.value = false;
    
    // Limpiar la imagen temporal
    if (uploadedImage.value) {
      URL.revokeObjectURL(uploadedImage.value);
      uploadedImage.value = null;
    }
    imageFile.value = null;
    
    // Refresh event list
    await fetchPromoterEvents();
  } catch (error) {
    console.error('Error creating event:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('promoter.dashboard.createEvent.error') || 'Error al crear el evento',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

// Cancel preview
const cancelPreview = () => {
  showPreview.value = false;
};

// View event details
const viewEventDetails = (eventId) => {
  router.push(`/events/${eventId}`);
};

// Get status severity
const getStatusSeverity = (status) => {
  const severities = {
    pending: 'warning',
    confirmed: 'success',
    accepted: 'success',
    rejected: 'danger',
    cancelled: 'danger',
    completed: 'info'
  };
  return severities[status] || 'info';
};
</script>

<template>
  <div class="dashboard-container">
    <!-- Event List View -->
    <div v-if="!showForm" class="dashboard-content p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-semibold">{{ t('promoter.dashboard.myEvents') }}</h2>
        <pv-button 
          @click="showCreateForm" 
          :label="t('promoter.dashboard.createEvent.title')"
          icon="pi pi-plus"
          class="p-button-primary"
        />
      </div>
      
      <div v-if="loadingEvents" class="flex justify-content-center p-4">
        <pv-progress-spinner />
      </div>
      
      <div v-else-if="promoterEvents.length === 0" class="text-center p-6">
        <p class="text-xl mb-4">{{ t('promoter.dashboard.noEvents') }}</p>
        <pv-button 
          @click="showCreateForm" 
          :label="t('promoter.dashboard.createEvent.title')"
          icon="pi pi-plus"
          size="large"
        />
      </div>
      
      <div v-else class="grid">
        <div v-for="event in promoterEvents" :key="event.id" class="col-12 md:col-6 lg:col-4 xl:col-4 mb-4">
          <pv-card class="h-full">
            <template #header>
              <div class="relative">
                <img 
                  :src="event.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'" 
                  :alt="event.name"
                  class="w-full h-15rem"
                  style="object-fit: cover;"
                />
                <div class="absolute top-0 right-0 m-2">
                  <pv-tag 
                    :value="$t(`promoter.dashboard.eventStatus.${event.status}`) || event.status"
                    :severity="getStatusSeverity(event.status)"
                  />
                </div>
              </div>
            </template>
            <template #title>
              <div class="text-xl font-bold">{{ event.name }}</div>
            </template>
            <template #content>
              <div class="flex flex-column gap-2">
                <div class="flex align-items-center">
                  <i class="pi pi-calendar mr-2 text-primary"></i>
                  <span>{{ formatDate(event.date) }}</span>
                </div>
                <div class="flex align-items-center">
                  <i class="pi pi-map-marker mr-2 text-primary"></i>
                  <span>{{ event.location }}</span>
                </div>
                <div class="flex align-items-center">
                  <i class="pi pi-tag mr-2 text-primary"></i>
                  <span>{{ event.genre }}</span>
                </div>
              </div>
            </template>
            <template #footer>
              <div class="flex justify-content-end">
                <pv-button 
                  @click="viewEventDetails(event.id)" 
                  :label="$t('eventApplications.viewEvent')"
                  icon="pi pi-eye"
                  outlined
                />
              </div>
            </template>
          </pv-card>
        </div>
      </div>
    </div>
    
    <!-- Event Creation Form -->
    <div v-if="showForm && !showPreview" class="dashboard-content p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-semibold">{{ t('promoter.dashboard.createEvent.title') }}</h2>
        <pv-button 
          @click="hideForm" 
          icon="pi pi-times" 
          class="p-button-rounded p-button-text"
          aria-label="Close"
        />
      </div>
      
      <pv-card class="mb-4">
        <template #content>
          <form @submit.prevent="previewEvent" class="p-fluid">
            <!-- Image Upload -->
            <div class="mb-4">
              <div class="upload-preview mb-3">
                <img 
                  :src="displayImageUrl" 
                  alt="Event preview" 
                  class="w-full h-15rem"
                  style="object-fit: cover; border-radius: 8px;"
                />
              </div>
              
              <div class="flex justify-content-center">
                <label class="p-button p-component p-fileupload-choose">
                  <span class="p-button-label">{{ $t('common.add') }} {{ $t('applicationDetail.image') || 'Imagen' }}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleImageUpload" 
                    class="hidden"
                    style="display: none;"
                  />
                </label>
              </div>
            </div>
            
            <!-- Basic Event Information -->
            <div class="grid">
              <div class="col-12 mb-4">
                <h3 class="text-xl font-semibold">{{ $t('applicationDetail.eventDetails') }}</h3>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-text 
                    id="name" 
                    v-model="event.name" 
                    :class="{'p-invalid': submitted && validationErrors.name}"
                    autofocus
                  />
                  <label for="name">{{ $t('applicationDetail.eventName') || 'Nombre del evento' }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.name" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-dropdown 
                    id="genre" 
                    v-model="event.genre" 
                    :options="genreOptions" 
                    :class="{'p-invalid': submitted && validationErrors.genre}"
                  />
                  <label for="genre">{{ $t('applicationDetail.genre') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.genre" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-text 
                    id="location" 
                    v-model="event.location" 
                    :class="{'p-invalid': submitted && validationErrors.location}"
                  />
                  <label for="location">{{ $t('applicationDetail.venue') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.location" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-text 
                    id="payment" 
                    v-model="event.payment" 
                    :class="{'p-invalid': submitted && validationErrors.payment}"
                  />
                  <label for="payment">{{ $t('applicationDetail.payment') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.payment" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-number 
                    id="duration" 
                    v-model="event.duration" 
                    :min="0.5" 
                    :step="0.5" 
                    :class="{'p-invalid': submitted && validationErrors.duration}"
                  />
                  <label for="duration">{{ $t('applicationDetail.duration') }} ({{ $t('applicationDetail.hours') }}) *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.duration" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-number 
                    id="capacity" 
                    v-model="event.capacity" 
                    :min="1" 
                    :class="{'p-invalid': submitted && validationErrors.capacity}"
                    @blur="updateAvailableTickets"
                  />
                  <label for="capacity">{{ $t('applicationDetail.venueCapacity') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.capacity" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 mb-3">
                <pv-float-label>
                  <pv-textarea 
                    id="description" 
                    v-model="event.description" 
                    rows="3" 
                    :class="{'p-invalid': submitted && validationErrors.description}"
                  />
                  <label for="description">{{ $t('applicationDetail.description') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.description" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 mb-3">
                <pv-float-label>
                  <pv-textarea 
                    id="requirements" 
                    v-model="event.requirements" 
                    rows="3" 
                    :class="{'p-invalid': submitted && validationErrors.requirements}"
                  />
                  <label for="requirements">{{ $t('applicationDetail.requirements') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.requirements" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 mb-3">
                <pv-float-label>
                  <pv-textarea 
                    id="equipment" 
                    v-model="event.equipment" 
                    rows="3" 
                    :class="{'p-invalid': submitted && validationErrors.equipment}"
                  />
                  <label for="equipment">{{ $t('applicationDetail.equipment') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.equipment" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
            </div>
            
            <!-- Technical Details -->
            <div class="grid mt-4">
              <div class="col-12 mb-4">
                <h3 class="text-xl font-semibold">{{ $t('applicationDetail.technicalDetails') }}</h3>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-text 
                    id="date" 
                    type="date" 
                    v-model="event.date" 
                    :min="new Date().toISOString().split('T')[0]"
                    :class="{'p-invalid': submitted && validationErrors.date}"
                  />
                  <label for="date">{{ $t('applicationDetail.eventDate') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.date" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-text 
                    id="time" 
                    type="time" 
                    v-model="event.time" 
                    :class="{'p-invalid': submitted && validationErrors.time}"
                  />
                  <label for="time">{{ $t('applicationDetail.eventTime') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.time" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-text 
                    id="soundcheckDate" 
                    type="date" 
                    v-model="event.soundcheckDate" 
                    :min="new Date().toISOString().split('T')[0]"
                    :max="event.date"
                    :class="{'p-invalid': submitted && validationErrors.soundcheckDate}"
                  />
                  <label for="soundcheckDate">{{ $t('applicationDetail.soundcheckDate') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.soundcheckDate" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-text 
                    id="soundcheckTime" 
                    type="time" 
                    v-model="event.soundcheckTime" 
                    :class="{'p-invalid': submitted && validationErrors.soundcheckTime}"
                  />
                  <label for="soundcheckTime">{{ $t('applicationDetail.soundcheckTime') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.soundcheckTime" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
              
              <div class="col-12 md:col-6 mb-3">
                <pv-float-label>
                  <pv-input-text 
                    id="adminContact" 
                    v-model="event.adminContact" 
                    :class="{'p-invalid': submitted && validationErrors.adminContact}"
                  />
                  <label for="adminContact">{{ $t('applicationDetail.adminContact') }} *</label>
                </pv-float-label>
                <small v-if="submitted && validationErrors.adminContact" class="p-error">
                  {{ $t('common.required') || 'Este campo es requerido' }}
                </small>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex justify-content-between mt-4">
              <pv-button 
                type="button" 
                @click="hideForm"
                :label="$t('common.cancel')" 
                icon="pi pi-times" 
                outlined
              />
              <pv-button 
                type="submit" 
                :label="$t('common.save')" 
                icon="pi pi-save" 
                :loading="loading"
              />
            </div>
          </form>
        </template>
      </pv-card>
    </div>
    
    <!-- Event Preview -->
    <div v-if="showForm && showPreview" class="dashboard-content p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-semibold">{{ t('promoter.dashboard.createEvent.preview') }}</h2>
        <pv-button 
          @click="hideForm" 
          icon="pi pi-times" 
          class="p-button-rounded p-button-text"
          aria-label="Close"
        />
      </div>
      
      <pv-card class="mb-4">
        <template #content>
          <div class="event-preview">
            <!-- Event Image -->
            <div class="mb-4">
              <img 
                :src="displayImageUrl" 
                :alt="event.name"
                class="w-full h-25rem"
                style="object-fit: cover; border-radius: 8px;"
              />
            </div>
            
            <!-- Event Header -->
            <div class="event-header flex align-items-start justify-content-between mb-4">
              <div class="header-content">
                <h1 class="text-3xl font-bold mb-3">{{ event.name }}</h1>
                <div class="flex align-items-center">
                  <i class="pi pi-calendar mr-2 text-lg"></i>
                  <span class="text-xl">{{ formattedDate }}</span>
                </div>
              </div>
              <pv-tag
                value="Nuevo"
                severity="info"
                size="large"
                class="ml-4"
              />
            </div>
            
            <!-- Event Details -->
            <div class="grid">
              <div class="col-12 md:col-6">
                <pv-panel :header="$t('applicationDetail.eventDetails')" class="h-full">
                  <div class="flex flex-column gap-3">
                    <div class="flex align-items-center">
                      <i class="pi pi-map-marker mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.location') }}:</span>
                      <span class="ml-2">{{ event.location }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-tag mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.genre') }}:</span>
                      <span class="ml-2">{{ event.genre }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-dollar mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.payment') }}:</span>
                      <span class="ml-2">{{ event.payment }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-clock mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.duration') }}:</span>
                      <span class="ml-2">{{ event.duration }} {{ $t('applicationDetail.hours') }}</span>
                    </div>
                  </div>
                </pv-panel>
              </div>
              
              <div class="col-12 md:col-6">
                <pv-panel :header="$t('applicationDetail.technicalDetails')" class="h-full">
                  <div class="flex flex-column gap-3">
                    <div class="flex align-items-center">
                      <i class="pi pi-calendar mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.eventDate') }}:</span>
                      <span class="ml-2">{{ formattedDate }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-clock mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.eventTime') }}:</span>
                      <span class="ml-2">{{ event.time }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-volume-up mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.soundcheckDate') }}:</span>
                      <span class="ml-2">{{ formattedSoundcheckDate }}</span>
                    </div>
                    <div class="flex align-items-center">
                      <i class="pi pi-clock mr-2"></i>
                      <span class="font-medium">{{ $t('applicationDetail.soundcheckTime') }}:</span>
                      <span class="ml-2">{{ event.soundcheckTime }}</span>
                    </div>
                  </div>
                </pv-panel>
              </div>
              
              <div class="col-12 mt-4">
                <pv-panel :header="$t('applicationDetail.description')">
                  <p>{{ event.description }}</p>
                </pv-panel>
              </div>
              
              <div class="col-12 mt-4">
                <pv-panel :header="$t('applicationDetail.requirements')">
                  <p>{{ event.requirements }}</p>
                </pv-panel>
              </div>
              
              <div class="col-12 mt-4">
                <pv-panel :header="$t('applicationDetail.equipment')">
                  <p>{{ event.equipment }}</p>
                </pv-panel>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex justify-content-between mt-4">
              <pv-button 
                @click="cancelPreview" 
                :label="$t('common.edit')" 
                icon="pi pi-pencil" 
                outlined
              />
              <pv-button 
                @click="submitForm" 
                :label="$t('common.confirm')" 
                icon="pi pi-check" 
                :loading="loading"
              />
            </div>
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.welcome-section {
  background-color: var(--surface-0);
  border-bottom: 1px solid var(--surface-200);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.p-card) {
  background-color: var(--surface-0);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  height: 100%;
}

:deep(.p-float-label) {
  width: 100%;
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-button) {
  transition: all 0.2s;
}

:deep(.p-button:hover) {
  transform: translateY(-1px);
}

:deep(.p-panel) {
  height: 100%;
}

:deep(.p-panel-content) {
  height: calc(100% - 4rem);
  padding: 1.25rem;
}

:deep(.p-tag) {
  font-size: 0.875rem;
  padding: 0.3rem 0.75rem;
}

.event-header {
  border-bottom: 1px solid var(--surface-200);
  padding-bottom: 1rem;
}

.header-content h1 {
  color: var(--surface-900);
}

.header-content .pi {
  color: var(--primary-color);
}

.p-error {
  color: var(--red-500);
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.h-15rem {
  height: 15rem;
}

.h-25rem {
  height: 25rem;
}
</style>