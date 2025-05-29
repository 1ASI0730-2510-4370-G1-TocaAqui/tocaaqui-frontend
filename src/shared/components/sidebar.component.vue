// @summary Shared sidebar component used across the application
// @author [Tu nombre]

<script>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'sidebar-component',
  props: {
    userName: {
      type: String,
      required: true
    }
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()

    const menuItems = computed(() => [
      { label: t('menu.dashboard'), icon: 'pi pi-home', route: '/dashboard' },
      { label: t('menu.applications'), icon: 'pi pi-file', route: '/applications' },
      { label: t('menu.search'), icon: 'pi pi-search', route: '/search' },
      { label: t('menu.agenda'), icon: 'pi pi-calendar', route: '/agenda' },
      { label: t('menu.evaluations'), icon: 'pi pi-star', route: '/evaluations' },
      { label: t('menu.payments'), icon: 'pi pi-money-bill', route: '/payments' }
    ])

    const isActive = (itemRoute) => {
      // Verifica si la ruta actual coincide exactamente o es una subruta
      return route.path === itemRoute || route.path.startsWith(`${itemRoute}/`)
    }

    return {
      menuItems,
      t,
      isActive
    }
  }
}
</script>

<template>
  <aside class="sidebar" role="navigation" :aria-label="t('common.mainMenu')">
    <div class="logo-container p-4 flex justify-content-between align-items-center">
      <h1 class="text-xl font-bold">TocaAqui</h1>
      <button 
        class="close-button md:hidden" 
        @click="$emit('close')"
        :aria-label="t('common.close')"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>
    
    <nav class="menu">
      <ul class="menu-list">
        <li v-for="item in menuItems" :key="item.route">
          <router-link 
            :to="item.route" 
            class="menu-item p-3 flex align-items-center"
            :class="{ 'active': isActive(item.route) }"
            @click="$emit('close')"
            :aria-label="item.label"
            :aria-current="isActive(item.route) ? 'page' : undefined"
          >
            <i :class="[item.icon, {'active-icon': isActive(item.route)}]" class="mr-2" aria-hidden="true"></i>
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: var(--surface-0);
  border-right: 1px solid var(--surface-200);
  position: fixed;
  left: 0;
  top: 0;
  font-family: 'Archivo', sans-serif;
}

.logo-container {
  font-family: 'Archivo', sans-serif;
  font-weight: bold;
  border-bottom: 1px solid var(--surface-200);
  margin-bottom: 0.5rem;
}

.menu-item {
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: 'Archivo', sans-serif;
  position: relative;
  padding: 0.75rem 1rem;
  margin: 0.25rem 0;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.app-dark) .menu-item:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.menu-item.active {
  background-color: rgba(0, 0, 0, 0.08);
  border-left-color: var(--primary-color);
  font-weight: 600;
}

:deep(.app-dark) .menu-item.active {
  background-color: rgba(255, 255, 255, 0.08);
}

.menu-item.active i {
  color: var(--primary-color);
}

.menu-item i {
  transition: color 0.2s ease;
}

.menu-item:hover i {
  color: var(--primary-color);
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.close-button {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 50%;
  background: var(--surface-ground);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--surface-hover);
}

.close-button i {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    background-color: #FFFFFF !important;
  }

  .menu-item:hover {
    background-color: #f5f5f5;
  }
}
</style> 