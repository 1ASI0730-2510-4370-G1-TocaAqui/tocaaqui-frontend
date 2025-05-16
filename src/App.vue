// @summary Root component of the application
// @author [Tu nombre]

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Sidebar from './shared/components/sidebar.component.vue';
import ThemeToggle from './shared/components/theme-toggle.component.vue';
import LanguageToggle from './shared/components/language-toggle.component.vue';
import { LoginService } from './login/services/login.service';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const isAuthenticated = ref(false);
const userName = ref('');
const userImage = ref('');
const isUserMenuVisible = ref(false);
const isSidebarVisible = ref(false);
const loginService = new LoginService();

// Título dinámico basado en la ruta actual
const currentTitle = computed(() => {
  const routeTitles = {
    '/': t('menu.dashboard'),
    '/dashboard': t('menu.dashboard'),
    '/applications': t('menu.applications'),
    '/profile': t('menu.profile'),
    '/search': t('menu.search'),
    '/agenda': t('menu.agenda'),
    '/evaluations': t('menu.evaluations'),
    '/payments': t('menu.payments')
  };
  
  // Si es una ruta de detalle de aplicación
  if (route.path.startsWith('/applications/')) {
    return t('applicationDetail.title');
  }
  
  return routeTitles[route.path] || t('menu.dashboard');
});

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

const toggleUserMenu = () => {
  isUserMenuVisible.value = !isUserMenuVisible.value;
};

const handleLogout = () => {
  loginService.logout();
  isAuthenticated.value = false;
  userName.value = '';
  userImage.value = '';
  router.push('/login');
};

// Cerrar el menú de usuario cuando se hace clic fuera
const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-menu');
  if (userMenu && !userMenu.contains(event.target)) {
    isUserMenuVisible.value = false;
  }
};

// Manejadores de eventos de login/logout
const handleLoginSuccess = (event) => {
  const user = event.detail;
  isAuthenticated.value = true;
  userName.value = user.name;
  userImage.value = user.imageUrl;
};

const handleLogoutEvent = () => {
  isAuthenticated.value = false;
  userName.value = '';
  userImage.value = '';
  router.push('/login');
};

// Manejador de evento de actualización de perfil
const handleProfileUpdate = (event) => {
  const user = event.detail;
  if (user) {
    userName.value = user.name;
    userImage.value = user.imageUrl;
  }
};

onMounted(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    isAuthenticated.value = true;
    userName.value = user.name;
    userImage.value = user.imageUrl;
  }
  
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('login-success', handleLoginSuccess);
  window.addEventListener('logout', handleLogoutEvent);
  window.addEventListener('profile-updated', handleProfileUpdate);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('login-success', handleLoginSuccess);
  window.removeEventListener('logout', handleLogoutEvent);
  window.removeEventListener('profile-updated', handleProfileUpdate);
});
</script>

<template>
  <div class="app-container">
    <template v-if="isAuthenticated">
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
          <div class="flex justify-content-between align-items-center p-3">
            <div class="flex align-items-center gap-3">
              <button 
                class="menu-toggle"
                @click="toggleSidebar"
                :aria-label="t('common.toggleMenu')"
              >
                <i class="pi pi-bars"></i>
              </button>
              <h1 class="text-xl">{{ currentTitle }}</h1>
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
              <div class="user-menu relative">
                <div 
                  class="user-info flex align-items-center gap-2 cursor-pointer" 
                  @click="toggleUserMenu"
                >
                  <span class="font-medium">{{ userName }}</span>
                  <pv-avatar
                    v-if="userImage"
                    :image="userImage"
                    shape="circle"
                    size="normal"
                    :aria-label="t('common.userProfile')"
                  />
                  <pv-avatar
                    v-else
                    icon="pi pi-user"
                    shape="circle"
                    size="normal"
                    :aria-label="t('common.userProfile')"
                  />
                </div>
                <!-- Menú desplegable -->
                <div v-if="isUserMenuVisible" class="user-dropdown">
                  <ul class="list-none p-0 m-0">
                    <li>
                      <router-link to="/profile" class="dropdown-item">
                        <i class="pi pi-user mr-2"></i>
                        {{ t('menu.profile') }}
                      </router-link>
                    </li>
                    <li>
                      <a @click="handleLogout" class="dropdown-item">
                        <i class="pi pi-sign-out mr-2"></i>
                        {{ t('common.logout') }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Router View -->
        <div class="content-wrapper p-4">
          <router-view></router-view>
        </div>
      </main>
    </template>

    <!-- Login page -->
    <template v-else>
      <router-view></router-view>
    </template>

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
  background-color: var(--surface-card);
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
  background-color: var(--surface-card);
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

.user-menu {
  position: relative;
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: var(--surface-hover);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
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
:root {
  &.dark {
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