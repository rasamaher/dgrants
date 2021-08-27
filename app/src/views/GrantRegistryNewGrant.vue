<template>
  <div class="flex flex-col justify-center sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md mt-5 md:mt-20 mb-12 md:mb-24">
      <h1>Setup Grant Contract</h1>
    </div>

    <div class="text-left">
      <form class="space-y-5" @submit.prevent="createGrant">
        <p class="border-b border-grey-100"></p>

        <!-- Grant name -->
        <BaseInput
          v-model="form.name"
          placeholder="Fusion – Icon Pack for Cryptonauts"
          id="grant-name"
          label="Title"
          :rules="isDefined"
          errorMsg="Please enter a name"
        />

        <!-- Owner address -->
        <BaseInput
          v-model="form.owner"
          placeholder="0xBADCdDEA250f1e317Ba59999232464933C4E8D90"
          description="has permission to edit the grant"
          id="owner-address"
          label="Owner address"
          :rules="isValidAddress"
          errorMsg="Please enter a valid address"
        />

        <!-- Payee address -->
        <BaseInput
          v-model="form.payee"
          placeholder="0xBADCdDEA250f1e317Ba59999232464933C4E8D90"
          description="contributions and matching funds are sent to"
          id="payee-address"
          label="Payee address"
          :rules="isValidAddress"
          errorMsg="Please enter a valid address"
        />

        <!-- Grant Description -->
        <BaseInput
          v-model="form.description"
          description="Your grant's description"
          id="grant-description"
          label="Grant description"
          :rules="isDefined"
          errorMsg="Please enter a description"
        />

        <div class="grid grid-cols-12 border-b border-grey-100">
          <div class="col-span-10 md:col-start-4 md:col-span-6 pt-5 pb-10 text-grey-400">
            Your good to go deploy your grant on chain. You can add and edit your Grant’s detailed informations
            afterwards.
          </div>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="btn btn-primary float-right"
          :class="{ 'btn-primary-disabled': !isFormValid }"
          :disabled="!isFormValid"
        >
          Deploy Contract
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import BaseInput from 'src/components/BaseInput.vue';
// --- Store ---
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
// --- Methods and Data ---
import { GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI } from 'src/utils/constants';
import { Contract } from 'src/utils/ethers';
import { isValidAddress, isValidUrl, isDefined, pushRoute } from 'src/utils/utils';
import * as ipfs from 'src/utils/ipfs';
// --- Types ---
import { GrantRegistry } from '@dgrants/contracts';

function useNewGrant() {
  const { signer } = useWalletStore();
  const { poll } = useDataStore();

  // Define form fields and parameters
  const form = ref<{ owner: string; payee: string; name: string; description: string }>({
    owner: '',
    payee: '',
    name: '',
    description: '',
  });
  const isFormValid = computed(
    () =>
      isValidAddress(form.value.owner) &&
      isValidAddress(form.value.payee) &&
      isDefined(form.value.name) &&
      isDefined(form.value.description)
  );

  /**
   * @notice Creates a new grant, parses logs for the Grant ID, and navigates to that grant's page
   */
  async function createGrant() {
    // Send transaction
    const { owner, payee, name, description } = form.value;
    if (!signer.value) throw new Error('Please connect a wallet');
    const metaPtr = await ipfs
      .uploadGrantMetadata({ name, description })
      .then((cid) => ipfs.getMetaPtr({ cid: cid.toString() }));
    const registry = <GrantRegistry>new Contract(GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, signer.value);
    const tx = await registry.createGrant(owner, payee, metaPtr);
    await tx.wait();

    // Parse receipt to find the grant ID
    const receipt = await signer.value.provider.getTransactionReceipt(tx.hash);
    const log = registry.interface.parseLog(receipt.logs[0]); // there is only one emitted event

    // Poll so the store has the latest data, then navigate to the grant page
    await poll();
    await pushRoute({ name: 'dgrants-id', params: { id: log.args.id.toString() } });
  }

  return { createGrant, isValidAddress, isValidUrl, isFormValid, isDefined, form };
}

export default defineComponent({
  name: 'GrantRegistryNewGrant',
  components: { BaseInput },
  setup() {
    return { ...useNewGrant() };
  },
});
</script>
