<template>
  <div class="">
    <h1 class="my-6 text-center text-3xl font-extrabold text-gray-900">404</h1>
    <div class="text-2xl text-gray-500 my-5">Oops. Page not found...</div>
    <div class="flex flex-row justify-center space-x-4">
      <button @click="routerGo(-1)" class="btn btn-primary my-5">Back</button>
      <button @click="routerPush('/')" class="btn btn-secondary my-5">Home</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Error404',
  setup() {
    const router = useRouter();
    /* eslint-disable @typescript-eslint/unbound-method */
    return { routerPush: router.push, routerGo: router.go };
    /* eslint-enable @typescript-eslint/unbound-method */
  },
});
</script>
