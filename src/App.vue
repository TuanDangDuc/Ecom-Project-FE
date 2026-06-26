<template>
  <div class="app-wrapper">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter v-if="!isDashboardLayout" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './components/Layout/Header.vue';
import AppFooter from './components/Layout/Footer.vue';

const route = useRoute();
const isDashboardLayout = computed(() => {
  return route.path.startsWith('/admin') || route.path.startsWith('/seller');
});
</script>

<style>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  padding-bottom: 40px;
}
</style>
