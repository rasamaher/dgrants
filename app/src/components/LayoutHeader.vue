<template>
  <header class="flex items-center gap-x-4 md:gap-x-8 h-28 mx-4 text-grey-400">
    <div class="group">
      <div class="relative">
        <div class="font-medium flex items-center h-14 cursor-pointer">
          <div>
            <!-- ToDo. Use icon-large when #131 is merged -->
            <img class="w-10 h-10 icon-large" src="../assets/logo.svg" alt="dGrant logo" />
          </div>
          <div class="ml-4 hidden md:block">
            <span class="text-teal">d</span><span class="text-grey-500">GRANTS</span>
          </div>
          <div class="ml-1">
            <!-- ToDo. Use icon-small when #131 is merged -->
            <ArrowBottomIcon
              class="object-contain stroke-2 text-grey-400 group-hover:text-grey-500 hover:text-grey-500 stroke-current"
            />
          </div>
        </div>
      </div>

      <div class="absolute hidden left-2 md:left-20 group-hover:block" style="z-index: 9999">
        <div
          class="border border-grey-400 p-6 pr-10 bg-white text-grey-400 flex flex-col gap-y-2 uppercase font-medium"
        >
          <router-link
            v-for="link in navigation"
            :key="link.name"
            :to="link.href"
            active-class="font-bold"
            exact
            class="font-medium text-gray-500 hover:text-gray-900"
          >
            {{ link.name }}
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="userDisplayName" class="ml-auto flex items-center gap-x-2">
      <div class="flex items-center gap-x-2 h-14 group cursor-pointer">
        <div class="hidden md:block group-hover:text-grey-500">Cart</div>
        <!-- ToDo. Use icon when #131 is merged -->
        <CartIcon
          class="object-contain stroke-2 text-grey-400 group-hover:text-grey-500 hover:text-grey-500 stroke-current"
        />
        <div class="group-hover:text-grey-500">12</div>
      </div>

      <div class="border-r border-grey-100 h-14"></div>

      <div class="group">
        <div class="relative flex items-center h-16 gap-x-2 group cursor-pointer">
          <div class="hidden md:block group-hover:text-grey-500">{{ userDisplayName }}</div>
          <div>
            <!-- ToDo. Use Jazzicon -->
            <img src="http://placekitten.com/64" />
          </div>
          <div>
            <!-- ToDo. Use icon-small when #131 is merged -->
            <ArrowBottomIcon
              class="object-contain stroke-2 text-grey-400 group-hover:text-grey-500 hover:text-grey-500 stroke-current"
            />
          </div>
        </div>

        <!-- menu-->
        <div class="absolute hidden right-2 md:right-20 group-hover:block" style="z-index: 9999">
          <div
            class="border border-grey-400 p-6 pr-10 bg-white text-grey-400 flex flex-col gap-y-2 uppercase font-medium"
          >
            <div>{{ userDisplayName }}</div>
            <div>1337 ETH</div>
            <div class="border-b border-grey-400 my-4"></div>

            <router-link
              to="#"
              class="cursor-pointer hover:text-grey-500 flex no-underline"
              active-class="text-grey-500"
              >profile</router-link
            >

            <router-link
              to="#"
              class="cursor-pointer hover:text-grey-500 flex no-underline"
              active-class="text-grey-500"
              >favorites<span class="pl-4 ml-auto">32</span></router-link
            >

            <router-link
              to="#"
              class="cursor-pointer hover:text-grey-500 flex no-underline"
              active-class="text-grey-500"
              >my grants<span class="pl-4 ml-auto">32</span></router-link
            >

            <router-link
              to="#"
              class="cursor-pointer hover:text-grey-500 flex no-underline"
              active-class="text-grey-500"
              >settings</router-link
            >

            <div class="border-b border-grey-400 my-4 flex"></div>

            <router-link
              to="#"
              class="cursor-pointer hover:text-grey-500 flex no-underline"
              active-class="text-grey-500"
              >change wallet</router-link
            >
          </div>
        </div>
      </div>
    </div>

    <div v-else @click="connectWallet" class="flex items-center h-14 gap-x-2 group cursor-pointer ml-auto">
      <div class="hidden md:block group-hover:text-grey-500">Connect</div>
      <div>
        <!-- ToDo. Use icon when #131 is merged -->
        <ConnectWalletIcon
          class="object-contain stroke-2 text-grey-400 group-hover:text-grey-500 hover:text-grey-500 stroke-current"
        />
      </div>
    </div>

    <div v-if="!isSupportedNetwork" class="text-pink">Not supportet Network!</div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useWalletStore from 'src/store/wallet';
import { Wallet3Icon as ConnectWalletIcon } from '@fusion-icons/vue/web3';
import { ArrowBottom2Icon as ArrowBottomIcon } from '@fusion-icons/vue/interface';
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';

// Header menu bar items
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Cart', href: '/cart' },
  { name: 'Contact', href: '/contact' },
];

export default defineComponent({
  name: 'LayoutHeader',
  components: { ConnectWalletIcon, ArrowBottomIcon, CartIcon },
  setup() {
    const { connectWallet, isSupportedNetwork, userDisplayName } = useWalletStore();
    return { connectWallet, isSupportedNetwork, navigation, userDisplayName };
  },
});
</script>
