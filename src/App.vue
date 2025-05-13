// @summary Root component of the application
// @author [Tu nombre]

<script>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import Sidebar from './shared/components/Sidebar.vue'
import ThemeToggle from './shared/components/ThemeToggle.vue'
import LanguageToggle from './shared/components/LanguageToggle.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    ThemeToggle,
    LanguageToggle
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()

    const currentTitle = computed(() => {
      const path = route.path.split('/')[1] || 'dashboard'
      return t(`menu.${path}`)
    })

    return { t, currentTitle }
  },
  data() {
    return {
      userName: 'John Doe',
      isSidebarVisible: false
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  }
}
</script>

<template>
  <div class="app-container">
    <!-- Overlay para móvil -->
    <div 
      v-show="isSidebarVisible" 
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <Sidebar 
      :user-name="userName" 
      @close="toggleSidebar"
      :class="['sidebar', { 'sidebar-active': isSidebarVisible }]"
    />
    
    <!-- Main Content -->
    <main :class="['main-content', { 'sidebar-pushed': isSidebarVisible }]">
      <!-- Header -->
      <header class="header">
        <div class="flex justify-content-between align-items-center">
          <div class="flex align-items-center gap-3">
            <button 
              class="menu-toggle"
              @click="toggleSidebar"
              :aria-label="t('common.toggleMenu')"
            >
              <i class="pi pi-bars"></i>
            </button>
            <h1 class="text-xl font-bold">{{ currentTitle }}</h1>
          </div>
          <div class="flex align-items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <pv-button
              icon="pi pi-bell"
              severity="secondary"
              text
              rounded
              :aria-label="t('common.notifications')"
            />
            <div class="user-info flex align-items-center gap-2">
              <span class="font-medium">{{ userName }}</span>
              <pv-avatar
                icon="pi pi-user"
                shape="circle"
                size="normal"
                :aria-label="t('common.userProfile')"
              />
            </div>
          </div>
        </div>
      </header>

      <!-- Router View -->
      <div class="content-wrapper p-4">
        <router-view></router-view>
      </div>
    </main>

    <!-- Toast -->
    <pv-toast />
  </div>
</template>

<style>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--surface-ground);
  position: relative;
  font-family: 'Archivo', sans-serif;
}

.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-color: var(--surface-0);
  border-right: 1px solid var(--surface-border);
  transform: translateX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1002;
  isolation: isolate;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.header {
  background-color: var(--surface-0);
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 1001;
}

.menu-toggle {
  display: none;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 50%;
  background: var(--surface-ground);
  color: var(--text-color);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-toggle:hover {
  background: var(--surface-hover);
}

.menu-toggle i {
  font-size: 1.2rem;
}

.content-wrapper {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.user-info {
  font-family: 'Archivo', sans-serif;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1001;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    background: #FFFFFF;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .sidebar-active {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .menu-toggle {
    display: flex;
  }

  .header {
    padding: 1rem;
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar-overlay:not([style*="display: none"]) {
    opacity: 1;
  }

  .user-info span {
    display: none;
  }
}

/* Dark mode */
:deep(.app-dark) {
  .menu-toggle {
    background: var(--surface-card);
    border-color: var(--surface-border);
  }

  .menu-toggle:hover {
    background: var(--surface-hover);
  }

  .sidebar {
    background: var(--surface-card);
    border-color: var(--surface-border);
  }

  .sidebar-overlay {
    background-color: rgba(0, 0, 0, 0.8);
  }

  @media (max-width: 768px) {
    .sidebar {
      background: var(--surface-900);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
    }
  }
}

:deep(.p-button),
:deep(.p-card),
:deep(.p-toast),
:deep(.p-message),
:deep(.p-selectbutton),
:deep(.p-toolbar),
:deep(.p-avatar),
:deep(.p-tooltip) {
  font-family: 'Archivo', sans-serif;
}
</style>
